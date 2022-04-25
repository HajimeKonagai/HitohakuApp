import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components';
import { Link } from 'react-router-dom';

type Props = {
	children: React.ReactNode|string;
};

export const DisableButton = (props: Props) =>
{
	const { children } = props;
	return <span className="link-button disable">{children}</span>
}


