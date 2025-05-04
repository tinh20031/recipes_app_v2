import * as Notifications from 'expo-notifications';
import { NotificationBehavior, NotificationContentInput, NotificationTriggerInput } from 'expo-notifications';
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
        shouldShowBanner: true,
        shouldShowList: true
      } as NotificationBehavior),
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
            recipe_id,
            scheduled_date,
            notification_time,
            cooking_duration,
            completed,
            notes,
            recipe:recipes(*)
          )
        `)
        .order('created_at', { ascending: false });

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
      // 1. Tạo menu mới (không cần user_id)
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .insert({
          name: menuData.name,
          start_date: menuData.start_date,
          end_date: menuData.end_date,
          description: menuData.description,
          is_active: menuData.is_active
        })
        .select()
        .single();

      if (menuError) throw menuError;

      // 2. Thêm recipes vào menu_recipes
      if (menuData.recipes && menuData.recipes.length > 0) {
        // Lọc trùng recipe_id
        const seen = new Set();
        const uniqueMenuRecipes = [];
        for (const recipe of menuData.recipes) {
          if (!seen.has(recipe.recipe_id)) {
            uniqueMenuRecipes.push(recipe);
            seen.add(recipe.recipe_id);
          }
        }
        const menuRecipes = uniqueMenuRecipes.map(recipe => ({
          menu_id: menu.id,
          recipe_id: recipe.recipe_id,
          scheduled_date: recipe.scheduled_date,
          notification_time: recipe.notification_time,
          completed: recipe.completed
        }));

        if (menuRecipes.length > 0) {
          const { error: menuRecipesError } = await supabase
            .from('menu_recipes')
            .insert(menuRecipes);

          if (menuRecipesError) throw menuRecipesError;
        }
      }

      // 3. Không cần schedule notification nếu không dùng

      runInAction(() => {
        this.menus.unshift(menu);
        this.setLoading(false);
      });
    } catch (error) {
      console.error('Create menu error:', error);
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to create menu');
        this.setLoading(false);
      });
    }
  }

  async updateMenu(menuId: string, updates: Partial<Menu>) {
    try {
      this.setLoading(true);
      
      // 1. Update menu basic info
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .update({
          name: updates.name,
          description: updates.description,
          start_date: updates.start_date,
          end_date: updates.end_date,
          is_active: updates.is_active
        })
        .eq('id', menuId)
        .select()
        .single();

      if (menuError) throw menuError;

      // 2. Update recipes if provided
      if (updates.recipes) {
        // Delete existing menu recipes
        const { error: deleteError } = await supabase
          .from('menu_recipes')
          .delete()
          .eq('menu_id', menuId);

        if (deleteError) throw deleteError;

        // Insert new menu recipes
        const menuRecipes = updates.recipes.map(recipe => ({
          menu_id: menuId,
          recipe_id: recipe.recipe_id,
          scheduled_date: recipe.scheduled_date,
          notification_time: recipe.notification_time,
          cooking_duration: recipe.cooking_duration,
          completed: recipe.completed
        }));

        if (menuRecipes.length > 0) {
          const { error: insertError } = await supabase
            .from('menu_recipes')
            .insert(menuRecipes);

          if (insertError) throw insertError;
        }
      }

      // 3. Update notifications
      await this.updateMenuNotifications(menu);

      runInAction(() => {
        const index = this.menus.findIndex(menu => menu.id === menuId);
        if (index !== -1) {
          this.menus[index] = { ...this.menus[index], ...menu };
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
      if (!recipe.completed && recipe.notification_time) {
        const [hours, minutes] = recipe.notification_time.split(':').map(Number);
        const scheduledDate = new Date(recipe.scheduled_date);
        scheduledDate.setHours(hours, minutes, 0, 0);

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time to cook: ${recipe.recipe?.title}`,
            body: `It's time to start cooking ${recipe.recipe?.title}!`,
            data: { menuId: menu.id, recipeId: recipe.recipe_id }
          } as NotificationContentInput,
          trigger: {
            type: 'date',
            date: scheduledDate
          } as NotificationTriggerInput
        });

        await supabase
          .from('menu_notifications')
          .insert({
            menu_id: menu.id,
            recipe_id: recipe.recipe_id,
            notification_id: notificationId,
            scheduled_for: scheduledDate.toISOString()
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