import { supabase } from '../lib/supabase';
import { User, Game, UserWithGames } from '../types';

export const userService = {
  // Get user profile with their games
  async getUserProfile(userId: string): Promise<UserWithGames | null> {
    try {
      // Get user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!user) return null;

      // Get user's games
      const { data: userGames, error: gamesError } = await supabase
        .from('user_games')
        .select(`
          game_id,
          games (*)
        `)
        .eq('user_id', userId);

      if (gamesError) throw gamesError;

      return {
        ...user,
        games: userGames?.map(ug => ug.games) || []
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  },

  // Update user's game preferences
  async updateGamePreferences(userId: string, gameIds: string[]): Promise<boolean> {
    try {
      // First delete all existing preferences
      const { error: deleteError } = await supabase
        .from('user_games')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then insert new preferences
      if (gameIds.length > 0) {
        const { error: insertError } = await supabase
          .from('user_games')
          .insert(gameIds.map(gameId => ({
            user_id: userId,
            game_id: gameId
          })));

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error updating game preferences:', error);
      return false;
    }
  },

  // Get potential matches based on game preferences
  async getPotentialMatches(userId: string): Promise<UserWithGames[]> {
    try {
      // First get the user's game IDs
      const { data: userGames } = await supabase
        .from('user_games')
        .select('game_id')
        .eq('user_id', userId);

      const userGameIds = userGames?.map(ug => ug.game_id) || [];

      // Get users who share at least one game with the current user
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_games!inner (
            game_id
          )
        `)
        .neq('id', userId)
        .in('user_games.game_id', userGameIds);

      if (error) throw error;
      if (!data) return [];

      // Get games for each potential match
      const usersWithGames = await Promise.all(
        data.map(async (user) => {
          const { data: userGames } = await supabase
            .from('user_games')
            .select(`
              game_id,
              games (*)
            `)
            .eq('user_id', user.id);

          return {
            ...user,
            games: userGames?.map(ug => ug.games) || []
          };
        })
      );

      return usersWithGames;
    } catch (error) {
      console.error('Error getting potential matches:', error);
      return [];
    }
  },

  // Get current authenticated user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as User;
  }
}; 