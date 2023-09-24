import { configureStore } from '@reduxjs/toolkit'
import metadataReducer from './metadataSlice'

export const store = configureStore({
  reducer: {
    metadata: metadataReducer
  }
})
