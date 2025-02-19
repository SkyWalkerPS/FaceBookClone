import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "rtn",
  initialState: {
    notification: [],
  },
  reducers: {
    setNotification: (state, action) => {
    if(action.payload.removed){
        state.notification = state.notification.filter((rem)=>(
            rem._id !== action.payload.exId
        ))
    } else if (action.payload.reaction === "like") {
        state.notification.push(action.payload);
      } else if (action.payload.reaction === "love") {
        state.notification.push(action.payload);
      } else if (action.payload.reaction === "wow") {
        state.notification.push(action.payload);
      } else if (action.payload.reaction === "sad") {
        state.notification.push(action.payload);
      } else if (action.payload.reaction === "angry") {
        state.notification.push(action.payload);
      } else if (action.payload.reaction === "haha") {
        state.notification.push(action.payload);
      }
      if (action.payload.reaction === "clear") {
        state.notification = [];
      }
      if(action.payload.text){
      state.notification.push(action.payload)
      }
      if(action.payload.originalPost){
        state.notification.push(action.payload)
      }
    },
  },
});

export const { setNotification } = rtnSlice.actions;
export default rtnSlice.reducer;