import React from 'react';
import { Redirect, Route, Switch } from 'wouter';
import Home from './components/Home';

/**
 * Standard wouter routing.
 * TODO -> Define our router format
 */
const Routes: React.FC = () => {
  return (
    <Switch>
      <Route path='/'>
        <Home />
      </Route>

      <Route path='/:rest*'>
        <Redirect to='/' />
      </Route>
    </Switch>
  );
};

export default Routes;
