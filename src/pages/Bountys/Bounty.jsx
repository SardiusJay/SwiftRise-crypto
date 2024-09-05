import { Container, Row, Col } from 'react-bootstrap';
import { PiMicrophoneStageBold } from 'react-icons/pi';
import './bounty.css';
import SwiftRise from '../../assets/Video-review.jpg';

const Bountys = () => {
	return (
		<Container>
			<Row>
				<Col className="text-center mt-5">
					<h1 className="fw-bolder">SwiftRise Bounty</h1>
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center pt-5">
				<Col md={5} className="d-md-block d-none mb-auto">
					<img src={SwiftRise} alt="" className="w-100 " />
				</Col>,
				<Col className="mt-5">
					<div className="d-flex align-items-center ">
						<span>
							<PiMicrophoneStageBold className="display-3 mx-4" />
						</span>{' '}
						<span className="h3 fw-bold">ORGANIZE A CONFERENCE</span>
					</div>
					<div className="mt-5 ">
						<h4 className="fw-bolder ps-4">WHAT ARE THE GUIDLINES</h4>
						<ol className="lead ms-3">
							<li>Organize a conference in your city dedicated to Swiftrise.</li>
							<li>Invite at least 50 people to the conference.</li>
							<li>Tell about working with Swiftrise to conference guests.</li>
							<li>Make a photo/video report about the conference.</li>
						</ol>
					</div>
					<div className="mt-5 ps-4">
						<h4 className="lead fw-bold">Extra benefits:</h4>
						<p className="lead">
							For the conference, you will receive a cash reward of up to $50,000. The more people come to
							your conference, the more reward you get.
						</p>
						<p className="lead">Depending on the quality and scale of the conference.</p>
						<p className="lead">
							Before the conference, please contact our support team. We will help you and provide you
							with all the necessary materials.
						</p>
						<p className="lead">
							Submit your video for verification and review, your cash rewards along with your rewards
							will be credited to your account in less than 24 hours.
						</p>
						<p className="lead">
							As a courtesy conference organizers will get reimbursement for all the expenses.
						</p>
					</div>
					<button className="bounty-button fw-bolder ms-4 mt-3">Submit for review</button>
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center">
				<Col className="mt-5">
					<div className="d-flex align-items-center ">
						
						<span className="h3 fw-bold">YOUTUBE/TIKTOK VIDEO REVIEW</span>
					</div>
					<div className="mt-5 ">
						<h4 className="fw-bolder ps-4">WHAT TO DO</h4>
						<ol className="lead ms-3">
							<li>Record a video review, where you talk about Swiftrise</li>
							<li>The video should show your face.</li>
							<li>Video must be at least HD 720p quality (1280x720).</li>
							<li>The minimum video length is 30 seconds.</li>
							<li>Upload the video to YouTube/TikTok.</li>
							<li>
								The description and name of the video should contain keywords to optimize the search for
								this topic.
							</li>
							<li>Leave the link to the Swiftrise website in the description.</li>
							<li>Post the video in your social network.</li>
						</ol>
					</div>
					<button className="bounty-button fw-bolder ms-4 mt-3">Submit for review</button>
				</Col>
				<Col md={5} className="d-md-block d-none">
					<img src={SwiftRise} alt="" className="w-100 " />
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center pt-5">
				<Col className="mt-5">
					<div className="d-flex align-items-center ">
						
						<span className="h3 fw-bold">ORGANIZE WEBINARS</span>
					</div>
					<div className="mt-5 ps-4">
						<h4 className="lead fw-bold mb-4">YOUR WEBMINAR MUST MEET THE FOLLOWING CRITERIA.</h4>
						<p className="lead">The duration of the video should be more than 3 minutes.</p>
						<p className="lead">The video should show your face.</p>
						<p className="lead">The video should be footage from the site Swiftrise</p>
						<p className="lead">The video should be interesting and creative.</p>
						<p className="lead">
							The video should show some of your actions (Purchase, withdrawal, the performance of
							bounty).
						</p>
						<p className="lead">
							The video should contain a story about the company and your experience with it.
						</p>
						<p className="lead">
							Any creativity and use of technologies are welcomed (dynamic installation, corporate style,
							integration of video inserts, shooting in an unusual place, use of a selfie stick or
							shooting from 1 person).
						</p>
					</div>
					<button className="bounty-button fw-bolder ms-4 mt-3">Submit for review</button>
				</Col>
				<Col md={5} className="d-md-block d-none mb-auto">
					<img src={SwiftRise} alt="" className="w-100 " />
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center pt-5 mt-5">
				<Col md={5} className="d-md-block d-none mb-auto">
					<img src={SwiftRise} alt="" className="w-100 " />
				</Col>
				<Col className="mt-5">
					<div className="d-flex align-items-center ">
						
						<span className="h3 fw-bold">YOUR BLOG OR WEBSITE</span>
					</div>
					<div className="mt-5 ">
						<h4 className="fw-bolder ps-4">WHAT TO DO</h4>
						<p className="lead m-3 ps-2">
							Write an article about Swiftrise and your experience with us on your website or personal
							blog. Your article must have the following criteria to qualify for rewards.
						</p>
						<ol className="lead ms-3">
							<li>The article must contain at least 500 characters.</li>
							<li>The article must contain at least 3 pictures or chart.</li>
							<li>The article should contain at least 2 links to the website Swiftrise.</li>
							<li>The article should be unique and interesting for the reader.</li>
						</ol>
					</div>
					<div className="mt-3 ps-4">
						<p className="lead">
							Please do not delete the article even after checking the job. In case of deletion, the
							result will be cancelled.
						</p>
						<p className="lead">
							Plagiarism, including translation of articles from other users into another language, is
							PROHIBITED.
						</p>
						<p className="lead">Submit the form below for review after you have done with your article.</p>
					</div>
					<button className="bounty-button fw-bolder ms-4 mt-3">Submit for review</button>
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center pt-5 mt-5">
				<Col className="mt-5">
					<div className="d-flex align-items-center ">
						
						<span className="h3 fw-bold">INVITING FRIENDS</span>
					</div>
					<div className="mt-5 ">
						<h4 className="fw-bolder ps-4">WHAT TO DO</h4>
						<ol className="lead ms-3">
							<li>Using your affiliate links, invite your friends to join Swiftrise.</li>
							<li>
								No review or submission needed for this task. Your affiliate bonus will be credited to
								your account automatically.
							</li>
							<li>For more information please check out our partnership page.</li>
						</ol>
					</div>
					<button className="bounty-button fw-bolder ms-4 mt-3">Submit for review</button>
				</Col>
				<Col md={5} className="d-md-block d-none">
					<img src={SwiftRise} alt="" className="w-100 " />
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center pt-5 mt-5">
				<Col className="mt-5">
					<div className="d-flex align-items-center ">
						
						<span className="h3 fw-bold">FACEBOOK,WHATSAPP SHARE</span>
					</div>
					<div className="mt-5 ">
						<h4 className="fw-bolder ps-4">WHAT TO DO</h4>
						<ol className="lead ms-3">
							<li>Sign up to the Swiftrise</li>
							<li>Share your affiliate link on Facebook, Whatsapp with your friends.</li>
							<li>Submit the form below for review.</li>
							<li>Submit for review</li>
						</ol>
					</div>
					<div className="mt-5 ps-4">
						<h4 className="lead">How to get rewards?</h4>
						<p className="lead">
							Send the link,screenshot,username to bounty@swiftrise.com about your promotion,we will
							review it and pay within 72 hours. Its easy to earn a $0.1~$50000 bounty, just try and earn
							extra money from the tik mining bounty program.
						</p>
						<p className="lead">Depending on the quality and scale of the conference.</p>
						<p className="lead">Copy the Content and share to social media?</p>
						<p className="lead">
							Tik Mining Helps you Mine More Bitcoin Like a Boss and Make Every Second Become Bitcoin,free
							100 gh/s,become rich in next bull market,withdraw instantly,Guaranteed Refund At Any
							Time,bitcoin=$1 million within 4 years.I already mined 0.5 bitcoin,Join my referral link
							now.
						</p>
						<p className="lead">https://swiftrise/index.php?ref=UserName</p>
					</div>
					<button className="bounty-button fw-bolder ms-4 mt-3">Submit for review</button>
				</Col>
				<Col md={5} className="d-md-block d-none mb-auto">
					<img src={SwiftRise} alt="" className="w-100 " />
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center pt-5 mt-5">
				<Col md={5} className="d-md-block d-none">
					<img src={SwiftRise} alt="" className="w-100 " />
				</Col>
				<Col className="mt-5">
					<div className="d-flex align-items-center ">
						
						<span className="h3 fw-bold">TWITTER,TELEGRAM SHARE</span>
					</div>
					<div className="mt-5 ">
						<h4 className="fw-bolder ps-4">WHAT TO DO</h4>
						<ol className="lead ms-3">
							<li>Sign up to the Swiftrise</li>
							<li>Share your affiliate link on Twitter,Telegram</li>
							<li>Submit the form below for review.</li>
							<li>Submit for review</li>
						</ol>
					</div>
					<button className="bounty-button fw-bolder ms-4 mt-3">Submit for review</button>
				</Col>
			</Row>
			<Row className=" align-items-center justify-content-center bg-light rounded mt-5">
				<div className="d-md-flex">
					<div>
						<Col className="p-5">
							<h1 className="fw-bolder">Get Rewards In 3 Steps</h1>
							<p className="col  h5">
								Rewards will be credited into your account regardless of your accounts status. You do
								not need to have an active machine to earn bounty rewards.
							</p>
						</Col>
					</div>
					<div className="d-md-flex align-items-center justify-content-center col col-md-6">
						<Col>
							<h5>Sign Up</h5>
						</Col>
						<Col>
							<h5>Participate in Bounty Programs</h5>
						</Col>
						<Col>
							<h5>Earn Rewards</h5>
						</Col>
					</div>
				</div>
			</Row>
			<Row className=" align-items-center justify-content-center mt-5">
				
				<Col  md={9}>
					<h3 className="fw-bolder" style={{ color: '#07214f' }}>
						How to get rewards?
					</h3>
					<p>
						<span style={{ color: '#cb447c' }}>
							Send the link,screenshot,username to bounty@swiftrise.com about your promotion,
						</span>promotion,we will review it and pay within 72 hours. Its easy to earn a $0.1~$50000
						bounty, just try and earn extra money from the tik mining bounty program.
					</p>
					<h3 className="fw-bolder">Copy the Content and share to social media?</h3>
					<p style={{ color: '#cb447c' }}>
						Swiftrise Mining Helps you Mine More Bitcoin Like a Boss and Make Every Second Become Bitcoin,free 100
						gh/s,become rich in next bull market,withdraw instantly,Guaranteed Refund At Any Time,bitcoin=$1
						million within 4 years.I already mined 0.5 bitcoin,Join my referral link now .
					</p>
					<p style={{ color: '#50cb44' }}>https://swiftrise/index.php?ref=UserName</p>
				</Col>
			</Row>
		</Container>
	);
};

export default Bountys;
