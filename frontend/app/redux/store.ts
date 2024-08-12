import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";


export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    // reducer: rootReducer,
    // middleware: (getDefaultMiddleware) =>
    //   getDefaultMiddleware({ serializableCheck: false }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];


