import * as Notifications from 'expo-notifications';
import { makeAutoObservable, runInAction } from 'mobx';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { CreateMenuDTO, Menu, MenuNotification } from '../models/Menu';

export class MenuViewModel {
  menus: Menu[] = [];
  notifications: MenuNotification[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.setupNotifications();
  }

  private async setupNotifications() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('menu-reminders', {
        name: 'Menu Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      this.setError('Không thể gửi thông báo vì chưa được cấp quyền');
    }

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  setLoading(status: boolean) {
    this.loading = status;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setMenus(menus: Menu[]) {
    this.menus = menus;
  }

  async fetchMenus() {
    try {
      this.setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .select(`
          *,
          recipes:menu_recipes(
            recipeId,
            scheduledDate,
            notificationTime,
            cookingDuration,
            completed,
            notes,
            recipe:recipes(*)
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      runInAction(() => {
        this.setMenus(data);
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to fetch menus');
        this.setLoading(false);
      });
    }
  }

  async createMenu(menuData: CreateMenuDTO) {
    try {
      this.setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .insert([menuData])
        .select()
        .single();

      if (error) throw error;

      // Schedule notifications for recipes
      await this.scheduleMenuNotifications(data);

      runInAction(() => {
        this.menus.unshift(data);
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to create menu');
        this.setLoading(false);
      });
    }
  }

  async updateMenu(menuId: string, updates: Partial<Menu>) {
    try {
      this.setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .update(updates)
        .eq('id', menuId)
        .select()
        .single();

      if (error) throw error;

      // Update notifications if schedule changed
      await this.updateMenuNotifications(data);

      runInAction(() => {
        const index = this.menus.findIndex(menu => menu.id === menuId);
        if (index !== -1) {
          this.menus[index] = { ...this.menus[index], ...data };
        }
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to update menu');
        this.setLoading(false);
      });
    }
  }

  async deleteMenu(menuId: string) {
    try {
      this.setLoading(true);
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId);

      if (error) throw error;

      // Cancel all notifications for this menu
      await this.cancelMenuNotifications(menuId);

      runInAction(() => {
        this.menus = this.menus.filter(menu => menu.id !== menuId);
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to delete menu');
        this.setLoading(false);
      });
    }
  }

  private async scheduleMenuNotifications(menu: Menu) {
    for (const recipe of menu.recipes) {
      if (recipe.notificationTime) {
        const notificationDate = new Date(recipe.scheduledDate);
        const [hours, minutes] = recipe.notificationTime.split(':');
        notificationDate.setHours(parseInt(hours), parseInt(minutes));

        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time to cook ${recipe.recipe?.name}!`,
            body: `Your scheduled recipe from menu "${menu.name}" is due to be cooked.`,
            data: { menuId: menu.id, recipeId: recipe.recipeId },
          },
          trigger: {
            date: notificationDate,
          },
        });

        // Save notification record
        await supabase.from('menu_notifications').insert({
          menuId: menu.id,
          recipeId: recipe.recipeId,
          scheduledFor: notificationDate.toISOString(),
          title: `Time to cook ${recipe.recipe?.name}!`,
          body: `Your scheduled recipe from menu "${menu.name}" is due to be cooked.`,
          notificationId: identifier,
        });
      }
    }
  }

  private async updateMenuNotifications(menu: Menu) {
    // Cancel existing notifications
    await this.cancelMenuNotifications(menu.id);
    // Schedule new notifications
    await this.scheduleMenuNotifications(menu);
  }

  private async cancelMenuNotifications(menuId: string) {
    const { data: notifications } = await supabase
      .from('menu_notifications')
      .select('notificationId')
      .eq('menuId', menuId);

    if (notifications) {
      for (const notification of notifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      }
    }

    await supabase
      .from('menu_notifications')
      .delete()
      .eq('menuId', menuId);
  }

  clearError() {
    this.error = null;
  }
} 