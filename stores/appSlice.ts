import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  token: string | null;
}

interface AppState {
  user: User;
  theme: 'light' | 'dark';
  isLoading: boolean;
}

const initialState: AppState = {
  user: {
    id: null,
    name: null,
    email: null,
    token: null,
  },
  theme: 'light',
  isLoading: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<User>>) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearUser: (state) => {
      state.user = {
        id: null,
        name: null,
        email: null,
        token: null,
      };
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setTheme, setLoading } = appSlice.actions;
export default appSlice.reducer;

