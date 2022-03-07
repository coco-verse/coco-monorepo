import addresses_staging from "./addresses-staging.json";
import addresses_dev from "./addresses-dev.json";

export const addresses = (() => {
	if (process.env.REACT_APP_VERCEL_ENV === "development") {
		return addresses_dev;
	} else {
		// reutur staging config for both prod & staging
		return addresses_staging;
	}
})();
