import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	loginModalState: {
		isOpen: false,
	},
};

const slice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		sUpdateLoginModalIsOpen(state, action) {
			if (typeof action.payload != "boolean") {
				return;
			}
			state.loginModalState.isOpen = action.payload;
		},
	},
});

export const { sUpdateLoginModalIsOpen } = slice.actions;

export const selectLoginModalState = (state) => state.ui.loginModalState;

export default slice.reducer;
