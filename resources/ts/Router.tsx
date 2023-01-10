import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Link,
  RouteProps,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useLogout, useUser } from './queries/AuthQuery';

import PageHome    from './pages/public/Home';
import PageInitial from './pages/public/Initial';
import PageFamily  from './pages/public/Family';
import PageGroup   from './pages/public/Group';
import PageList    from './pages/public/List';
import PageDetail  from './pages/public/Detail';
import PageSearch  from './pages/public/Search';

import AdminLayout from './pages/admin/Layout';
import AdminIndex  from './pages/admin/Index';
import AdminImport from './pages/admin/Import';
import AdminUpload from './pages/admin/Upload';
import AdminCreate from './pages/admin/Create';
import AdminEdit   from './pages/admin/Edit';
import AdminLog    from './pages/admin/Log';
import AdminReport from './pages/admin/Report';
import AdminExport from './pages/admin/Export';


import Loading from './components/Loading';
import BackButton from './pages/public/components/BackButton';

const Router: React.VFC = () =>
{
	// const logout = useLogout();
	const { isLoading, data: authUser } = useUser();


	const location = useLocation();
	if (isLoading) return (<>ユーザーをロード中<Loading /></>);

	const logout = (event) =>
	{
		event.preventDefault();
		document.getElementById('logout-form').submit();
	}
		


	if (
		!isLoading &&
		!authUser &&
		location.pathname.startsWith('/admin')
	)
	{
		window.location.replace('/login');
	}


	return (
		<>
			<header>
				<BackButton />
				<h1>
					ひとはく植物標本画像データベース
					<small style={{fontSize: '0.7rem', marginLeft: '1rem'}}>v 1.0.9</small>
				</h1>
				{authUser && (
					<nav className="admin">
						<ul>
							<li><Link to="/admin">管理トップ</Link></li>
							<li><Link to="/admin/create">新規データ追加</Link></li>
							<li><Link to="/admin/import">CSVインポート</Link></li>
							<li><Link to="/admin/export">CSVエクスポート</Link></li>
							<li><Link to="/admin/upload">画像アップロード</Link></li>
							<li><Link to="/admin/report">データチェックレポート</Link></li>

							<li>

								<a href="#"
									onClick={logout}>
										ログアウト
									</a>
							</li>
						</ul>
					</nav>
				) || (<nav />)}
			</header>

			<main>
				<Routes>
					<Route path="/" element={<PageHome />} />
					<Route path="initial/:field" element={<PageInitial />} />
					<Route path="family/:field/:initial" element={<PageFamily />} />
					<Route path="group/:field/:initial" element={<PageGroup />} />
					<Route path="list/:jp_name/:jp_family_name/:en_name/:en_family_name" element={<PageList />} />
					<Route path="detail/:number" element={<PageDetail />} />
					<Route path="search" element={<PageSearch />} />

				{authUser && (
					<>
					<Route path="login" element={<Navigate to="/admin" />} />
					<Route path="admin" element={<Outlet />} >
						<Route path="" element={<AdminIndex />} />
						<Route path="import" element={<AdminImport />} />
						<Route path="upload" element={<AdminUpload />} />
						<Route path="create" element={<AdminCreate />} />
						<Route path="edit/:number" element={<AdminEdit />} />
						<Route path="log" element={<AdminLog />} />
						<Route path="report" element={<AdminReport />} />
						<Route path="export" element={<AdminExport />} />
					</Route>
					</>
				) || (
					<>
					<Route path="admin/*" element={<Navigate to="/login"  replace={true} />} />
					</>
				)}
				</Routes>
			</main>

			<footer>
				<Link to="/"
					state={{
						prev: location.pathname,
					}}

				>トップに戻る</Link>
				<Link to="/search"
					state={{
						prev: location.pathname,
					}}
				>自由検索</Link>

			</footer>
		</>
	);
}

export default Router;
