import { Input as AntInput, InputProps, InputRef } from 'antd';
import { SearchProps } from 'antd/es/input/Search';
import { TextAreaProps } from 'antd/es/input/TextArea';
import React, { ForwardRefExoticComponent, RefAttributes, forwardRef } from 'react';

type InputComponent = ForwardRefExoticComponent<InputProps & RefAttributes<InputRef>> & {
  Search: React.FC<SearchProps>;
  TextArea: React.FC<TextAreaProps>;
  Password: React.FC<InputProps>;
};

const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  return <AntInput ref={ref} {...props} />;
}) as InputComponent;

Input.Search = AntInput.Search;
Input.TextArea = AntInput.TextArea;
Input.Password = AntInput.Password;

export { Input };
