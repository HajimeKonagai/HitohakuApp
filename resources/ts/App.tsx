import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/ErrorFallback'
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

	const [ errors, setErrors ] = useState([]);

	const onError = (error: Error, info: { componentStack: string }) =>
	{
		setErrors([
			error.message,
			info.componentStack,
		])
	}

	return (
		<div className={`container ${windowClassName}`}>

		{errors.length > 0 && (<div style={{
			border: '4px double #F00',
			margin: '4rem',
			padding: '1rem',
		}}>
			<h1>申し訳ありません、予期せぬエラーが発生しました。</h1>
			<p style={{fontSize:'1.2rem'}}><strong>もしよろしければ、この画面のまま。係員に報告してください。<br />操作を続けられる場合は、下記の「トップに戻る」から再度操作しなおしてください。</strong></p>
			{errors.map((error) => (
				<p>{error}</p>
			)}
		</div>)}
		<ErrorBoundary FallbackComponent={ErrorFallback} onError={onError}>
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Router />
			</BrowserRouter>
			<ToastContainer hideProgressBar={true} />
			{/*<ReactQueryDevtools initialIsOpen={false} /> */}
		</QueryClientProvider>
		</ErrorBoundary>
		</div>
	);
}

export default App;
