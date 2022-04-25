import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

type Props = {
	to: string;
	children: React.ReactNode|string;
};

export const LinkButton = (props: Props) =>
{
	const location = useLocation();
	const { to, children } = props;

	return <Link
		className="link-button"
		to={to}
		state={{
			prev: location.pathname,
		}}
	>{children}</Link>
}

