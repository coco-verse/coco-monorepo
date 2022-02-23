import addresses_prod from "./addresses-prod.json";
import addresses_dev from "./addresses-dev.json";
import addresses_staging from "./addresses-staging.json";

export const addresses = (() => {
	if (process.env.REACT_APP_VERCEL_ENV === "production") {
		return addresses_prod;
	} else if (process.env.REACT_APP_VERCEL_ENV === "preview") {
		return addresses_staging;
	} else {
		return addresses_dev;
	}
})();
