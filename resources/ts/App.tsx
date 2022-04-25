import React, {useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useWindowDimensions } from './classes/useWindowDimensions'
import Router from './Router'

const App: React.VFC = () =>
{
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				// cacheTime: 1000,
			},
			mutations: {
				retry: false,
			},
		}
	});

	const { width, height } = useWindowDimensions();
	const windowClassName = width < height ? 'vertical': 'horizontal';

	return (
		<div className={`container ${windowClassName}`}>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Router />
			</BrowserRouter>
			<ToastContainer hideProgressBar={true} />
			{/*<ReactQueryDevtools initialIsOpen={false} /> */}
		</QueryClientProvider>
		</div>
	);
}

export default App;
