
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import FilteredView from './components/FilteredView';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import Dashboard from './components/Dashboard';
import FiltersAndLabels from './components/FiltersAndLabels';

const MainContent = () => {
    const { viewMode } = useApp();
    
    if (viewMode === 'week') {
        return <WeekView />;
    }
    if (viewMode === 'dashboard') {
        return <Dashboard />;
    }
    if (viewMode === 'filters') {
        return <FilteredView />;
    }
    if (viewMode === 'filters-management') {
        return <FiltersAndLabels />;
    }
    return <DayView />;
};

const App = () => {
  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
    </AppProvider>
  );
};

export default App;