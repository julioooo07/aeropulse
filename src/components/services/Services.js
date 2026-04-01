import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Services.css';
import ServiceCard from './ServiceCard';
import ServiceFilters from './ServiceFilters';
import ServiceBookingModal from './ServiceBookingModal';

function Services() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'repair', name: 'Repair' },
    { id: 'installation', name: 'Installation' },
    { id: 'warranty', name: 'Warranty' },
    { id: 'consultation', name: 'Consultation' }
  ];

  const services = [
    {
      id: 1,
      name: 'Maintenance',
      icon: '🔧',
      description: 'Regular check-ups and cleaning for your AC to ensure optimal performance and energy efficiency.',
      duration: '1-2 hours',
      technicians: 2,
      price: 899,
      category: 'maintenance',
      popular: true
    },
    {
      id: 2,
      name: 'Repair',
      icon: '⚙️',
      description: 'AC repair services for any issues including compressor problems, refrigerant leaks, and electrical faults.',
      duration: '2-3 hours',
      technicians: 2,
      price: 1499,
      category: 'repair',
      popular: true
    },
    {
      id: 3,
      name: 'Installation',
      icon: '❄️',
      description: 'Professional AC installation services with proper mounting, piping, and electrical connections.',
      duration: '3-4 hours',
      technicians: 2,
      price: 2499,
      category: 'installation'
    },
    {
      id: 4,
      name: 'Warranty',
      icon: '📜',
      description: 'Extended warranty plans for peace of mind covering parts and labor for your AC unit.',
      duration: '1 year',
      technicians: 1,
      price: 1999,
      category: 'warranty'
    },
    {
      id: 5,
      name: 'Consultation',
      icon: '💡',
      description: 'Expert advice on choosing the right AC unit for your space, energy efficiency tips, and system optimization.',
      duration: '1 hour',
      technicians: 1,
      price: 499,
      category: 'consultation'
    },
    {
      id: 6,
      name: 'Chemical Cleaning',
      icon: '🧪',
      description: 'Deep chemical cleaning to remove stubborn dirt, mold, and bacteria from your AC unit.',
      duration: '2 hours',
      technicians: 2,
      price: 1299,
      category: 'maintenance'
    },
    {
      id: 7,
      name: 'Gas Top-up',
      icon: '💨',
      description: 'Refrigerant gas top-up service to restore cooling performance.',
      duration: '1.5 hours',
      technicians: 1,
      price: 799,
      category: 'repair'
    },
    {
      id: 8,
      name: 'Emergency Repair',
      icon: '🚨',
      description: '24/7 emergency repair service for urgent AC breakdowns.',
      duration: '2-4 hours',
      technicians: 2,
      price: 2499,
      category: 'repair',
      popular: true
    }
  ];

  const handleBack = () => {
    navigate('/home');
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (service, bookingData) => {
    const totalPrice = service.price + (bookingData.technician === 'senior' ? 200 : bookingData.technician === 'express' ? 500 : 0);
    
    const bookingDetails = {
      ...bookingData,
      service: service.name,
      price: service.price,
      totalPrice: totalPrice,
      bookingId: Date.now(),
      status: 'pending'
    };
    
    // Save booking to localStorage
    const existingBookings = localStorage.getItem('bookings');
    const bookings = existingBookings ? JSON.parse(existingBookings) : [];
    bookings.push(bookingDetails);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    alert(`Booking confirmed for ${service.name} on ${bookingData.date} at ${bookingData.time}\nTotal: ₱${totalPrice.toLocaleString()}`);
    setShowBookingModal(false);
    setSelectedService(null);
  };

  const getFilteredServices = () => {
    let filtered = services;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredServices = getFilteredServices();

  return (
    <div className="services-page-container">
      <div className="services-header">
        <div className="services-header-content">
          <div className="services-header-left">
            <button className="back-btn" onClick={handleBack}>←</button>
            <h1 className="services-title">AC Services</h1>
          </div>
        </div>
      </div>

      <main className="services-main">
        <div className="services-hero">
          <h1>Professional AC Services</h1>
          <p>Expert technicians ready to serve you with quality and reliability</p>
          <div className="services-hero-stats">
            <div className="stat-item">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Services Done</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>

        <ServiceFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearch={setSearchTerm}
        />

        <div className="services-grid">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={handleBookService}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            No services found matching your criteria.
          </div>
        )}
      </main>

      {showBookingModal && selectedService && (
        <ServiceBookingModal
          service={selectedService}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}

export default Services;