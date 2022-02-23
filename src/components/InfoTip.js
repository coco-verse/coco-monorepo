import { Tooltip } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

function InfoTip({ infoText, ...children }) {
	return (
		<Tooltip label={infoText}>
			<InfoIcon {...children}  />
		</Tooltip>
	);
}

export default InfoTip;
