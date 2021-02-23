import { CSSProperties } from 'react';

export const container: CSSProperties = {
  width: '100%',
  maxWidth: '1120px',
  height: '100vh',
  margin: '0 auto',
  color: '#977db3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
},
  textContainer: CSSProperties = {
    display: 'grid',
    gridTemplateRows: '1fr 1fr auto auto',
    rowGap: '5px',
    alignContent: 'center',
    textAlign: 'center',
    justifyItems: 'center'
  },
  textStyle: CSSProperties = {
    fontFamily: 'Rubik',
    fontSize: '1.3rem',
    color: '#47307a'
  },
  svgStyle: CSSProperties = {
    width: '50%',
    height: '50%'
  },
  linkStyle: CSSProperties = {
    width: '80px',
    height: '40px',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#47307a',
    border: '1px solid #fff',
    borderRadius: '8px',
    textDecoration: 'none',
    padding: 10
  };
