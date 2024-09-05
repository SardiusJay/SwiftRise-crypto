import { useRoutes } from 'react-router-dom';
import { Landing, About, Review, Login, Signup } from '../pages';
import Bountys from '../pages/Bountys/Bounty';
import DashBoard from '../DashBoard/DashBoard';
import History from '../DashBoard/History/History';

export const Routes = () => {
	return useRoutes([
		{
			path: '/',
			element: <Landing />
		},
		{
			path: 'bounty',
			element: <Bountys />
		},
		{
			path: 'about',
			element: <About />
		},
		{
			path: 'reviews',
			element: <Review />
		},
		{
			path: 'log-in',
			element: <Login />
		},
		{
			path: 'sign-up',
			element: <Signup />
		},
		{
			path: 'dashboard',
			element: <DashBoard />
		},
		{
			path: 'history',
			element: <History/>
		}
	]);
};
