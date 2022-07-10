import React, { useEffect, useState } from 'react';

const ErrorFallback = () => 
{

  return (<div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <a className="link-button" href="/">トップに戻る</a> 
  </div>);
}

export default ErrorFallback;