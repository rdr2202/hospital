import React, { useState } from 'react';
import { Users, UserCheck, ChevronDown } from "lucide-react";

const calculateSummaryStats = (doctors, allocations) => {
  const organizationCount = 1;
  const totalResources = doctors.length;
  const uniqueRoles = new Set(doctors.map(d => d.role || 'unspecified')).size;
  const allocatedCount = new Set(Object.keys(allocations)).size;

  const employeeStats = {
    totalEmployees: doctors.length,
    breakdowns: {
      'Main Doctor': {
        total: doctors.filter(d => d.role === 'admin-doctor').length,
        allocated: doctors.filter(d => 
          d.role === 'admin-doctor' && allocations[d._id]?.length > 0
        ).length
      },
      'Assistant Doctor': {
        total: doctors.filter(d => d.role === 'assistant-doctor').length,
        allocated: doctors.filter(d => 
          d.role === 'assistant-doctor' && allocations[d._id]?.length > 0
        ).length
      },
      'Other Staff': {
        total: doctors.filter(d => !['admin-doctor', 'assistant-doctor'].includes(d.role)).length,
        allocated: doctors.filter(d => 
          !['admin-doctor', 'assistant-doctor'].includes(d.role) && 
          allocations[d._id]?.length > 0
        ).length
      }
    }
  };

  return {
    summaryMetrics: [
      { label: 'Organization Count', value: organizationCount },
      { label: 'No of Resources', value: totalResources },
      { label: 'Roles', value: uniqueRoles },
      { label: 'No of Resources Allocated', value: allocatedCount }
    ],
    employeeStats
  };
};

const SummaryCard = ({ label, value }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>
);

const AllocationSummary = ({ doctors, allocations, allocationSummary }) => {
  const { summaryMetrics, employeeStats } = calculateSummaryStats(doctors, allocations);
  const [showDetails, setShowDetails] = useState(false);

  const generateAllocationTable = () => {
    return allocationSummary.map((item, index) => ({
      id: index,
      doctor: item.doctor,
      role: item.role,
      follow: item.follow,
      allocatedRoles: item.roles
    }));
  };

  const tableData = generateAllocationTable();

  return (
    <div className="mb-6">
      {/* Header with View Details Button */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Allocation Summary
          </h2>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
            <ChevronDown className={`w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`space-y-6 transition-all duration-300 ${showDetails ? 'block' : 'hidden'}`}>
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {summaryMetrics.map((metric, index) => (
            <SummaryCard key={index} label={metric.label} value={metric.value} />
          ))}
        </div>

        {/* Employee Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employee Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">No of Employees</span>
              <span className="font-semibold">{employeeStats.totalEmployees}</span>
            </div>
            <div className="space-y-2">
              {Object.entries(employeeStats.breakdowns).map(([role, stats], index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-gray-600">{role}</span>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">
                      {stats.allocated}/{stats.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Allocation Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Detailed Allocation Table
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follows
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocated Roles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.role}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                      {row.follow}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                      {row.allocatedRoles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationSummary;