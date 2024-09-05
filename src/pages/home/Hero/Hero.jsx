import './hero.css';
import miner from '../../../assets/s9miner.jpeg';
import minerMan from '../../../assets/miner-image.jpeg';
import { AiOutlinePlus } from 'react-icons/ai';
import swift from '../../../assets/swift.mp4';
import Swiftrise from '../../../assets/Swiftrise.mp4';
import { Row, Col, Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const Hero = () => {

	const [ count, setCount ] = useState(1);
	useEffect(
		() => {
			const intervalId = setInterval(() => {
				if (count < 23827) {
					setCount((preCount) => preCount + 40);
				} else {
					clearInterval(intervalId);
				}
			}, 1);

			return () => {
				clearInterval(intervalId);
			};
		},
		[ count ]
	);
	const [ count1, setCount1 ] = useState(1);
	useEffect(
		() => {
			const intervalId = setInterval(() => {
				if (count1 < 33310) {
					setCount1((preCount) => preCount + 40);
				} else {
					clearInterval(intervalId);
				}
			}, 1);

			return () => {
				clearInterval(intervalId);
			};
		},
		[ count1 ]
	);
	const [ count2, setCount2 ] = useState(1);
	useEffect(
		() => {
			const intervalId = setInterval(() => {
				if (count2 < 30207) {
					setCount2((preCount) => preCount + 40);
				} else {
					clearInterval(intervalId);
				}
			}, 1);

			return () => {
				clearInterval(intervalId);
			};
		},
		[ count2 ]
	);
	return (
		<div className="hero">
			<div className="big-card">
				<div className="card-left">
					<div className="top-ctas">
						<div className="top-cta1">Cloud mining</div>
					</div>
					<div className="card-texts">
						<p className="card-heading-text">Start your Bitcoin mining Journey today.</p>
						<p className="card-normal-text">Get your final payout today </p>
					</div>
					<div className="card-bottom-cta">
						<button>Join for Free</button>
					</div>
				</div>
				<div className="card-right d-md-block d-none">
					<img src={miner} alt="Antminner" />
					<div className="image-text">
						<p className="card-right-name"> Antminer $9k</p>
					</div>
					<div className="btc-per-time">
						<p>0.4354556 BTC Daily</p>
						<p>0.4354556 BTC Monthly</p>
					</div>
				</div>
			</div>
			<div className="middle-cards">
				<div className="middle-card ">
					<div className="background-image">
						<img src="" alt="" />
					</div>
					<div className="middle-card-texts">
						<p className="middle-card-text-title">Stable Income</p>
						<p className="middle-card-text-desc">Our powerful mining pool guarantees a stable income</p>
					</div>
				</div>

				<div className="middle-card mt-3">
					<div className="background-image">
						<img src="" alt="" />
					</div>
					<div className="middle-card-texts">
						<p className="middle-card-text-title">Reliable security system</p>
						<p className="middle-card-text-desc">
							A thoughtful and reliable security system that protects the assets and privacy of users
						</p>
					</div>
				</div>

				<div className="middle-card mt-3">
					<div className="background-image">
						<img src="" alt="" />
					</div>
					<div className="middle-card-texts">
						<p className="middle-card-text-title">Multiple tokens</p>
						<p className="middle-card-text-desc">
							Currently, the Swiftrise pool supports Bitcoin (BTC), Etherium (ETH) and Bitcoin Cash (BACK)
						</p>
					</div>
				</div>
			</div>

			<div className="middle-objects">
				<div className="middle-object">
					<div className="background-image">
						<img src="" alt="" />
					</div>
					<div className="middle-object-texts">
						<p className="middle-object-text-title">{count}</p>
						{/* <p className="middle-object-text-title">23827</p> */}
						<p className="middle-object-text-desc">Users</p>
					</div>
				</div>

				<div className="middle-object">
					<div className="background-image">
						<img src="" alt="" />
					</div>
					<div className="middle-object-texts">
						<p className="middle-object-text-title">{count1}</p>
						{/* <p className="middle-object-text-title">1310.8879</p> */}
						<p className="middle-object-text-desc">Users</p>
					</div>
				</div>

				<div className="middle-object">
					<div className="background-image">
						<img src="" alt="" />
					</div>
					<div className="middle-object-texts">
						<p className="middle-object-text-title">{count2}</p>
						{/* <p className="middle-object-text-title">30207</p> */}
						<p className="middle-object-text-desc">Users</p>
					</div>
				</div>
			</div>

			<Container>
				<Row className="align-items-center justify-content-center pt-5">
					<Col className="mt-5">
						<div>
							<div className="">
								<p>What is Swiftrise?</p>
								<p>
									Swiftrise is a simple and affordable cloud mining service. The main purpose of which
									is to introduce a wider audience to the world of bitcoin and other cryptocurrencies.
									Swiftrise has a huge number of ASIIC miners who mine bitcoin daily on the Swiftrise
									pool.
								</p>
							</div>
							<div className="what-is-button">
								<button>Try from here</button>
							</div>
						</div>
					</Col>
					<Col md={5} className="d-md-block d-none mb-auto">
						{/* <img src={SwiftRise} alt="" className="w-100 " /> */}
						<img src={minerMan} alt="miner man" className="w-100 " />
					</Col>
				</Row>
				<Row className="align-items-center justify-content-center pt-5">
					<Col md={5} className="d-md-block d-none mb-auto">
						<div className="earn-image">
							<video controls>
								<source src={swift} type="video/mp4" className="w-100 " />
							</video>
						</div>
					</Col>
					<Col className="mt-5">
						<p>Earn Money with Swiftrise?</p>
						<p>
							To start mining bitcoins, just select a miner equipment from your personal Swiftrise
							account, each miner has a different cost and rental period. Each equipment generates a
							unique account of bitcoin daily. These coins are deposited to your personal account. You
							just have to collect your coins everyday without any cost
						</p>
					</Col>
				</Row>
				<Row className="align-items-center justify-content-center pt-5">
					<Col className="mt-5">
						<div>
							<div className="">
								<p className="title">Extensive range of services</p>
								<p>
									The Swiftrise pool is an important part of the global Swiftrise ecosystem. Uses
									thesame accounting system as our cloud minning service to ensure security. The
									Swiftrise and Swiftrise pool aims to erase the line between mining and trading by
									providing users with a wide range of mining solutions.
								</p>
							</div>
						</div>
					</Col>
					<Col md={5} className="d-md-block d-none mb-auto">
					<div className="earn-image">
						<video controls>
							<source src={Swiftrise} type="video/mp4" className="w-100 " />
						</video>
					</div>
				</Col>
				</Row>
			</Container>
			<div className="FAQ">
				<p className="title">FAQ</p>
				<div className="faq-lists">
					{[
						'What is Cloud Minning?',
						'How does it work?',
						'when can I withdraw funds from my account?',
						'Can I rent several different miners?',
						'What payment method do you accept and what coins can be mined?',
						'Do you have an affiliate program and how does it work?'
					].map((list, id) => (
						<div key={id} className="faq-list">
							<p>{list}</p>
							<AiOutlinePlus />
						</div>
					))}
				</div>
			</div>
			<div className="end">
				<p>Start your bitcoin mining journey today!</p>
				<button>
					<p>Register Now</p>
				</button>
			</div>
		</div>
	);
};

export default Hero;
