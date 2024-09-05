import { useState } from 'react';
import { Pagination, Card, Col, Row, Container } from 'react-bootstrap';
import {  SiBitcoincash } from 'react-icons/si';
import '../history.css'

const itemsPerPage = 18; // Number of cards to display per page

const data = [
	{ id: 1, title: '$0.0100', content: 'Profit' },
	{ id: 2, title: '$0.0100', content: 'Profit' },
	{ id: 3, title: '$0.0100', content: 'Profit' },
	{ id: 4, title: '$0.0100', content: 'Profit' },
	{ id: 5, title: '$0.0100', content: 'Profit' },
	{ id: 6, title: '$0.0100', content: 'Profit' },
	{ id: 7, title: '$0.0100', content: 'Profit' },
	{ id: 8, title: '$0.0100', content: 'Profit' },
	{ id: 9, title: '$0.0100', content: 'Profit' },
	{ id: 11, title: '$0.0100', content: 'Profit' },
	{ id: 12, title: '$0.0100', content: 'Profit' },
	{ id: 13, title: '$0.0100', content: 'Profit' },
	{ id: 14, title: '$0.0100', content: 'Profit' },
	{ id: 15, title: '$0.0100', content: 'Profit' },
	{ id: 16, title: '$0.0100', content: 'Profit' },
	{ id: 17, title: '$0.0100', content: 'Profit' },
	{ id: 18, title: '$0.0100', content: 'Profit' },
	{ id: 19, title: '$0.0100', content: 'Profit' },
	{ id: 20, title: '$0.0100', content: 'Profit' },
	{ id: 21, title: '$0.0100', content: 'Profit' },
	{ id: 22, title: '$0.0100', content: 'Profit' },
	{ id: 23, title: '$0.0100', content: 'Profit' },
	{ id: 24, title: '$0.0100', content: 'Profit' },
	{ id: 25, title: '$0.0100', content: 'Profit' },
	{ id: 26, title: '$0.0100', content: 'Profit' },
	{ id: 27, title: '$0.0100', content: 'Profit' },
	{ id: 28, title: '$0.0100', content: 'Profit' },
	{ id: 29, title: '$0.0100', content: 'Profit' }

	// Add more cards as needed
];

const Pagnition = () => {
	const [ activePage, setActivePage ] = useState(1);

	const handlePageChange = (page) => {
		setActivePage(page);
	};

	const startIndex = (activePage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentPageCards = data.slice(startIndex, endIndex);
	return (
		<Container>
			<div>
				<Row className="justify-content-center align-items-center">
					{currentPageCards.map((card) => (
						<Col md={4}>
							<Card key={card.id} className="__card">
								<Card.Body className="d-flex">
									<span className="divider" />
                                    <SiBitcoincash className="pag-icon" />
									<div className="me-5">
										<Card.Title>{card.title}</Card.Title>
									</div>
									<div className="__pag_margin">
										<Card.Text>{card.content}</Card.Text>
									</div>
								</Card.Body>
							</Card>
						</Col>
					))}
				</Row>

				<Pagination>
					<Pagination.First onClick={() => handlePageChange(1)} />
					<Pagination.Prev onClick={() => handlePageChange(activePage - 1)} disabled={activePage === 1} />

					{[ ...Array(Math.ceil(data.length / itemsPerPage)) ].map((_, index) => (
						<Pagination.Item
							key={index + 1}
							active={index + 1 === activePage}
							onClick={() => handlePageChange(index + 1)}
						>
							{index + 1}
						</Pagination.Item>
					))}

					<Pagination.Next
						onClick={() => handlePageChange(activePage + 1)}
						disabled={activePage === Math.ceil(data.length / itemsPerPage)}
					/>
					<Pagination.Last onClick={() => handlePageChange(Math.ceil(data.length / itemsPerPage))} />
				</Pagination>
			</div>
		</Container>
	);
};

export default Pagnition;
