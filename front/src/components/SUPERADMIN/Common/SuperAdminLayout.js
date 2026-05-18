import React from 'react';
import SuperAdminHeader from './SuperAdminHeader';
import SuperAdminSidebar from './SuperAdminSidebar';
import '../superAdminShared.css';

const SuperAdminLayout = ({ title, subtitle, children }) => {
  return (
    <div className="super-layout">
      <SuperAdminSidebar />
      <div className="super-layout-main">
        <SuperAdminHeader title={title} subtitle={subtitle} />
        {children}
      </div>
    </div>
  );
};

export default SuperAdminLayout;