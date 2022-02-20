import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

const web3 = createAlchemyWeb3(process.env.ALCHEMY_WSS_URL);

export async function events_processor(error, log) {
    
}

export function startEventsSubscription() {
	web3.eth.subscribe(
		"logs",
		{
			address: "0x",
		},
		events_processor
	);
}
