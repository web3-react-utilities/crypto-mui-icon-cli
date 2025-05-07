import { IconUrls } from "../types";
import { Box, SvgIconProps } from "@mui/material";
import MuiSvgIcon from "@mui/material/SvgIcon";
import { useTheme } from "@mui/material/styles";

type IconProps = SvgIconProps & {
    urls: IconUrls;
    modeOnly?: "light" | "dark";
    title: string;
};
export default function IconCrypto({ urls, title, modeOnly, ...svgProps }: IconProps) {
    const theme = useTheme();
    return (
        <MuiSvgIcon {...svgProps} titleAccess={title} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
            <Box
                component={"image"}
                width="70"
                height="70"
                xlinkHref={modeOnly ? (modeOnly == "dark" ? urls.darkModeUrl : urls.lightModeUrl) : theme.palette.mode === "dark" ? urls.darkModeUrl : urls.lightModeUrl}
                xlinkTitle={title}
            />
        </MuiSvgIcon>
    );
}
