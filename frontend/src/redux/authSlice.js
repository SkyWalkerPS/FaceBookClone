import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        selectedUser:null,
        allUsers: []
    },
    reducers:{
        setAuthUser:(state,action) => {
            state.user = action.payload;
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        },
        setAllUser:(state,action) => {
            state.allUsers = action.payload;
        }
    }
});
export const {
    setAuthUser, 
    setSuggestedUsers, 
    setUserProfile,
    setSelectedUser,
    setAllUser,
} = authSlice.actions;
export default authSlice.reducer;