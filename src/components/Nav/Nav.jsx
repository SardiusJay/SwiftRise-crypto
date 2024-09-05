import logo from '../../assets/logo.png';
import './nav.css';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const Nav = () => {
	const [ isMobileMenuOpen, setMobileMenuOpen ] = useState(false);

	const linkStyles = ({ isActive }) => ({
		fontWeight: isActive ? '600' : '400'
	});

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<div className="nav-container">
			<div className="navbar">
				<div className="left">
					<div className="logoContainer">
						<  	img src={logo} alt="logo" />
						<div className="logoTexts">
							<p></p>
							<p className="navLetterSpacing">MINING</p>
						</div>
					</div>
					<div className="navLinks">
						<ul>
							<li>
								<NavLink style={linkStyles} to="/">
									Home
								</NavLink>
							</li>
							<li>
								<NavLink style={linkStyles} to="/bounty">
									Swiftrise Bounty
								</NavLink>
							</li>
							<li>
								<NavLink style={linkStyles} to="/about">
									About Us
								</NavLink>
							</li>
							<li>
								<NavLink style={linkStyles} to="/reviews">
									Reviews
								</NavLink>
							</li>
						</ul>
					</div>
				</div>
				<div className="navButtons">
					<NavLink to="/log-in">
						<button>Log in</button>
					</NavLink>

					<NavLink to="/sign-up">
						<button className="greenBtn">Sign up</button>
					</NavLink>
				</div>
			</div>
			
		</div>
	);
};


export default Nav;
