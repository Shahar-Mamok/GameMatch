import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Swipe: undefined;
};

export type TabParamList = {
  Cards: undefined;
  Profile: undefined;
  Chats: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 