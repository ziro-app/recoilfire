import React, { lazy } from 'react';
import useGlobalHistory from "@bit/ziro.utils.history";
import { useAnimatedLocation } from '@bit/vitorbarbosa19.ziro.flow-manager';
import { Switch, Route } from '@bit/vitorbarbosa19.ziro.route';
import NotFoundLib from '@bit/vitorbarbosa19.ziro.not-found';
import Home from './components/Home';
import Login from './components/Login';

// Dynamic imports
const NotFound = lazy(() => import('./components/NotFound'));
const DisplaySuppliers = lazy(() => import('./components/DisplaySuppliers'));

/**
 * Standard wouter routing.
 * TODO -> Define our router format
 */
const Routes: React.FC = () => {
  // Hook used to activate the
  // use of a global browsing history
  const { } = useGlobalHistory();

  return (
    <Switch
      defaultPublicOnlyFallback={<NotFoundLib />}
      defaultPrivateOnlyFallback={<Login />}>

      {/* Visible to logged and logged out users */}
      <Route path='/'>
        <Home />
      </Route>

      {/* Way used to 'protect' a private
        route from unauthorized access without reactfire */}
      <Route path='/suppliers' privateOnly>
        <DisplaySuppliers />
      </Route>

      {/* Visible to logged out users */}
      <Route path='/:rest*' publicOnly>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Routes;
