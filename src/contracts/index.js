import addresses_prod from "./addresses-prod.json";
import addresses_dev from "./addresses-dev.json";

export const addresses = (() => {
	if (process.env.REACT_APP_VERCEL_ENV === "production") {
		return addresses_prod;
	} else {
		return addresses_dev;
	}
})();
