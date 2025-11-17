import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Home, 
  CreditCard, 
  Plus,
  Download,
  Send,
  Clock,
  Wrench,
  FileText
} from 'lucide-react';

interface OverviewTabProps {
  overviewMetrics: Array<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }>;
  quickActions: Array<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
  recentActivity: Array<{
    type: string;
    title: string;
    time: string;
    amount?: string;
    status: string;
    icon: React.ReactNode;
  }>;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const OverviewTab = ({ 
  overviewMetrics, 
  quickActions, 
  recentActivity, 
  getStatusBadge 
}: OverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`${metric.color} p-3 rounded-lg bg-gray-50`}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Quick Actions</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                  onClick={action.onClick}
                >
                  {action.icon}
                  <span className="text-sm font-medium">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      {activity.amount && (
                        <span className="text-xs font-medium text-green-600">{activity.amount}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

