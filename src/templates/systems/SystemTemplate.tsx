import { SvgComponent } from '../types';
import MuiSvgIcon from '@mui/material/SvgIcon';
import { Box } from '@mui/material';
import { PNG_SYSTEM_{{SYSTEM_NAME}} } from '../constants/imagePaths';
import { useTheme } from '@mui/material/styles';

export const Icon{{SYSTEM_NAME}}: SvgComponent = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <MuiSvgIcon {...props} titleAccess={'{{SYSTEM_NAME}}'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 70 70">
      <Box 
        component={'image'} 
        width="70" 
        height="70" 
        xlinkHref={isDarkMode ? PNG_SYSTEM_{{SYSTEM_NAME}}.darkmode : PNG_SYSTEM_{{SYSTEM_NAME}}.lightmode} 
        xlinkTitle={'{{SYSTEM_NAME}}'}
      />
    </MuiSvgIcon>
  );
};