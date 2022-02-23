import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { useSelector } from "react-redux";

const initialState = {
	marketIdentifiers: {},
};

const slice = createSlice({
	name: "badMarkets",
	initialState,
	reducers: {
		sUpdateBadMarketIdentifiers(state, action) {
			if (action.payload.markets) {
				let marketIdentifiers = {};
				action.payload.markets.forEach((market) => {
					marketIdentifiers[market.marketIdentifier] = true;
				});
				state.marketIdentifiers = {
					...marketIdentifiers,
				};
			}
		},
	},
});

export const { sUpdateBadMarketIdentifiers } = slice.actions;

export const selectBadMarketIdentifiers = (state) =>
	state.badMarkets.marketIdentifiers;

export default slice.reducer;
