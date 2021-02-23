import React from 'react';
import { Link } from 'wouter';
import {
  container,
  linkStyle,
  svgStyle,
  textContainer,
  textStyle
} from './styles';

const NotFound: React.FC = () => {
  return (
    <div style={container}>
      <img alt='Test' style={svgStyle} />
      <div style={textContainer}>
        <h1 style={textStyle}>Ops !!</h1>
        <h1 style={textStyle}>Algo de errado não está certo</h1>
        <h1 style={textStyle}>
          A página buscada não existe, certifique-se que está buscando a página
          correta e tente novamente.
        </h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            paddingTop: '20px',
            textDecoration: 'none'
          }}>
          {/* Possible to have the same result using the methods of hook history
              Example: DisplaySyppliers page */}
          <Link style={linkStyle} href='/'>
            Voltar
          </Link>
          <Link style={linkStyle} href='/suppliers'>
            Suppliers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
