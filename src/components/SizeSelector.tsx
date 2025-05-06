// File: ./src/components/SizeSelector.tsx

import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material';
import React from 'react';

import {SizeOption, useSize} from './SizeContext.js';

export const SizeSelector: React.FC = () => {
   const {size, setSize, getSizeSettings} = useSize();
   const sizeSettings = getSizeSettings();

   const handleSizeChange = (event: SelectChangeEvent) => {
      setSize(event.target.value as SizeOption);
   };

   return (
      <FormControl
         size={sizeSettings.input.size}
         sx={{
            'minWidth': 120,
            '& .MuiInputLabel-root': {
               color: '#B0B0B0',
               fontSize: sizeSettings.text.fontSize,
            },
            '& .MuiOutlinedInput-root': {
               'color': '#FFFFFF',
               'fontSize': sizeSettings.text.fontSize,
               '& fieldset': {
                  borderColor: '#424242',
               },
               '&:hover fieldset': {
                  borderColor: '#616161',
               },
               '&.Mui-focused fieldset': {
                  borderColor: '#90CAF9',
               },
            },
            '& .MuiSelect-icon': {
               color: '#B0B0B0',
               fontSize: sizeSettings.icon.fontSize,
            },
            '& .MuiMenuItem-root': {
               'color': '#FFFFFF',
               'fontSize': sizeSettings.text.fontSize,
               '&:hover': {
                  backgroundColor: '#424242',
               },
            },
         }}>
         <InputLabel id='size-select-label'>Size</InputLabel>
         <Select
            labelId='size-select-label'
            value={size}
            label='Size'
            onChange={handleSizeChange}
            MenuProps={{
               PaperProps: {
                  sx: {
                     'backgroundColor': '#1E1E1E',
                     '& .MuiMenuItem-root': {
                        'color': '#FFFFFF',
                        'fontSize': sizeSettings.text.fontSize,
                        '&:hover': {
                           backgroundColor: '#424242',
                        },
                     },
                  },
               },
            }}>
            <MenuItem value='xs'>Extra Small</MenuItem>
            <MenuItem value='sm'>Small</MenuItem>
            <MenuItem value='md'>Medium</MenuItem>
            <MenuItem value='lg'>Large</MenuItem>
            <MenuItem value='xl'>Extra Large</MenuItem>
         </Select>
      </FormControl>
   );
};
