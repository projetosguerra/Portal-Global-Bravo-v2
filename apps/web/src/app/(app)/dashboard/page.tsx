import { Card } from '@pgb/ui';
import type { ReactElement } from 'react';
import { dashboard as sdk } from '@pgb/sdk';
import { LineAreaChart } from '../../../components/charts/LineAreaChart';
import { RecentOrdersTable } from '../../../components/dashboard/RecentOrdersTable';
import { DocsValidity } from '../../../components/dashboard/DocsValidity';

interface KPI {
  label: string;
  value: string | number;
  delta?: number | null;
}

interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  status: string;
}

interface SACDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension?: number;
  fill?: boolean;
  [key: string]: any;
}

interface SACSeries {
  labels: string[];
  datasets: SACDataset[];
}

interface RecentOrder {
  orderNumber: string;
  seller: string;
  total: number;
  status: 'faturado' | 'bloqueado' | 'liberado';
  [key: string]: any;
}

interface DocAlert {
  description: string;
  dueDate: string;
  docNumber: string;
  status: 'valido' | 'vencido' | 'proximo_vencer';
  [key: string]: any;
}


export default async function DashboardPage(): Promise<ReactElement> {
  const [kpis, recent, sacSeries, orders, docs]: [KPI[], Patient[], SACSeries, RecentOrder[], DocAlert[]] = await Promise.all([
    sdk.getMetrics(),
    sdk.getRecentPatients(),
    sdk.getSACSeries(),
    sdk.getRecentOrders(),
    sdk.getDocumentAlerts(),
  ]);

  const { labels, datasets } = sacSeries;

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 lg:grid-cols-4">
        {kpis.map((k: KPI, index: number) => {
          const icons: ReactElement[] = [
            <svg key="1" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>,
            <svg key="2" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>,
            <svg key="3" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>,
            <svg key="4" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>,
          ];
          
          const gradients: string[] = [
            'from-blue-500 to-blue-600',
            'from-emerald-500 to-emerald-600',
            'from-orange-500 to-orange-600',
            'from-purple-500 to-purple-600',
          ];

          return (
            <Card key={k.label} className="relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-slate-500 mb-1 sm:mb-2 truncate">{k.label}</div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">{k.value}</div>
                    {typeof k.delta === 'number' && (
                      <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${k.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {k.delta >= 0 ? (
                            <polyline points="18 15 12 9 6 15"/>
                          ) : (
                            <polyline points="6 9 12 15 18 9"/>
                          )}
                        </svg>
                        {k.delta >= 0 ? '+' : ''}{k.delta}%
                      </div>
                    )}
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} text-white shadow-lg flex-shrink-0`}>
                    {icons[index % icons.length]}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tl from-gray-100 to-transparent opacity-50 rounded-tl-full" />
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">Últimos Atendimentos</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Atendimentos recentes realizados</p>
            </div>
            <button className="text-[#4a90e2] hover:text-[#2563eb] text-xs sm:text-sm font-medium flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
              Ver todos
              <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {recent.map((p: Patient, idx: number) => (
              <div key={p.id} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#4a90e2] to-[#2563eb] flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm">{p.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{p.lastVisit}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                    p.status === 'finalizado' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'aguardando' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">Análise de Atendimentos</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Evolução nos últimos meses</p>
          </div>
          <LineAreaChart labels={labels} datasets={datasets} height={280} />
        </Card>
      </section>

      <section>
        <RecentOrdersTable orders={orders} />
      </section>

      <section>
        <DocsValidity docs={docs} />
      </section>
    </div>
  );
}