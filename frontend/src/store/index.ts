import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import enquiryReducer from './slices/enquirySlice';
import followupReducer from './slices/followUpSlice';
import studentReducer from './slices/studentSlice';
import studentCourseReducer from './slices/studentCourseSlice';
import paymentReducer from './slices/paymentSlice';
import courseReducer from './slices/courseSlice';
import facultyReducer from './slices/facultySlice';
import batchReducer from './slices/batchSlice';
import labReducer from './slices/labSlice';
import logReducer from './slices/logSlice';
import analyticsReducer from './slices/analyticsSlice';
import rolesReducer from './slices/rolesSlices';
import notificationReducer from './slices/notificationSlice';
import admissionReducer from './slices/admissionSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    enquiry: enquiryReducer,
    followUp: followupReducer, // ⬅️ Register it here
    student: studentReducer,
    studentCourse: studentCourseReducer,
    payment: paymentReducer,
    course: courseReducer,
    faculty: facultyReducer,
    batch: batchReducer,
    lab: labReducer,
    log: logReducer,
    analytic: analyticsReducer,
    role: rolesReducer,
    notification: notificationReducer,
    admission: admissionReducer
    // add more reducers here (notifications, enquiry etc)
  },
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;