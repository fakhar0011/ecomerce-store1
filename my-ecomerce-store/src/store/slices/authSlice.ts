import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// User ka structure
interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
}

// State ka structure
interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

        // ← User login or not
        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isAdmin = action.payload.role === "admin";
        },

        // ← User logout or not
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
        },

        // ← Role update 
        updateRole: (state, action: PayloadAction<"admin" | "user">) => {
            if (state.user) {
                state.user.role = action.payload;
                state.isAdmin = action.payload === "admin";
            }
        },
    },
});

export const {
    setUser,
    clearUser,
    updateRole } = authSlice.actions;
export default authSlice.reducer;