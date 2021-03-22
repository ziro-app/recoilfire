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
const Routes = () => {
  // Hook que inicializa o histórico global da aplicação
  const { history } = useGlobalHistory();
  console.log(history);

  return (
    <Switch
      defaultPublicOnlyFallback={<NotFoundLib />}
      defaultPrivateFallback={<Login />}>

      {/* Rotas públicas -> Visíveis para usuários logados e deslogados */}
      <Route path='/' >
        <Home />
      </Route>

      {/* Rotas privadas -> Visíveis apenas para usuários logados */}
      <Route path='/suppliers' private>
        <DisplaySuppliers />
      </Route>

      {/* Rotas que apenas usuários deslogados podem ver.
          Ex: Para uso de gestão da conta -> Esqueci minha senha, Reenviar email de confirmação, etc */}
      <Route path='/:rest*' publicOnly>
        <NotFound />
      </Route>
    </Switch>
  );
};

export default Routes;
