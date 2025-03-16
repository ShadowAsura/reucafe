import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          You do not have permission to access this page.
        </Alert>
      </Container>
    );
  }

  const runScraper = async (source) => {
    setLoading(true);
    setMessage(null);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(
        `/api/scrapers/run/${source}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(response.data.message);
      setResults({ [source]: response.data.count });
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while running the scraper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}. Use this dashboard to manage the REU Cafe application.</p>

      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header as="h5">Program Scrapers</Card.Header>
            <Card.Body>
              <p>Run scrapers to update the program database with the latest information.</p>
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => runScraper('sciencepathways')}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : null} Run Science Pathways Scraper
                </Button>
              </div>

              {message && (
                <Alert variant="success" className="mt-3">
                  {message}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              {results && (
                <Card className="mt-3">
                  <Card.Header>Scraper Results</Card.Header>
                  <Card.Body>
                    <ul>
                      {Object.entries(results).map(([source, count]) => (
                        <li key={source}>
                          <strong>{source}:</strong> {count} programs
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;