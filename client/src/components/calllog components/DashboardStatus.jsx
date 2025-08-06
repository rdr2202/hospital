import React from 'react';

const StatusCard = ({ title, metrics }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center border-b pb-2">
      {title}
    </h3>
    <div className="space-y-4">
      {metrics.map((metric, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{metric.label}</span>
          <span className={`text-lg font-bold ${
            metric.label.includes('%') ? 'text-blue-600' : 'text-gray-800'
          }`}>
            {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
            {metric.label.includes('%') ? '%' : ''}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const DashboardStatus = ({ dashboardData }) => {
  const statusCards = [
    {
      title: "Call Completion",
      metrics: [
        { label: "Total Scheduled", value: dashboardData.totalCallsScheduled },
        { label: "Completed", value: dashboardData.totalCallsCompleted },
        { label: "Completion %", value: dashboardData.callCompletionPercentage }
      ]
    },
    {
      title: "Follow-up Calls",
      metrics: [
        { label: "Total Scheduled", value: dashboardData.totalFollowUpCallsScheduled },
        { label: "Completed", value: dashboardData.totalFollowUpCallsCompleted },
        { label: "Completion %", value: dashboardData.followUpCallCompletionPercentage }
      ]
    },
    {
      title: "Queries Follow-ups",
      metrics: [
        { label: "Total Scheduled", value: dashboardData.totalQuieresCallsScheduled },
        { label: "Completed", value: dashboardData.totalQuieresCallsCompleted },
        { label: "Completion %", value: dashboardData.quieresCallCompletionPercentage }
      ]
    },
    {
      title: "Payment Follow-ups",
      metrics: [
        { label: "Total Scheduled", value: dashboardData.totalPaymentFollowUpsScheduled },
        { label: "Completed", value: dashboardData.totalPaymentFollowUpsCompleted },
        { label: "Completion %", value: dashboardData.paymentFollowUpCompletionPercentage },
        { label: "FCR", value: dashboardData.paymentFollowUpFCR },
        { label: "Payment Conversion %", value: dashboardData.paymentFollowUpConversion }
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <StatusCard 
            key={index}
            title={card.title}
            metrics={card.metrics}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardStatus;