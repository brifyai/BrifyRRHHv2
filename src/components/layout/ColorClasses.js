// Componente auxiliar para forzar la generación de clases de color personalizadas
// Este componente no se renderiza pero ayuda a Tailwind a generar las clases necesarias

const ColorClasses = () => {
  // Este componente existe solo para forzar la generación de clases de Tailwind
  // No se debe renderizar en la aplicación
  
  return (
    <div className="hidden">
      {/* Clases de texto */}
      <div className="text-engage-black"></div>
      <div className="text-engage-yellow"></div>
      <div className="text-engage-blue"></div>
      
      {/* Clases de fondo */}
      <div className="bg-engage-black"></div>
      <div className="bg-engage-yellow"></div>
      <div className="bg-engage-blue"></div>
      
      {/* Clases de borde */}
      <div className="border-engage-black"></div>
      <div className="border-engage-yellow"></div>
      <div className="border-engage-blue"></div>
      
      {/* Variantes hover */}
      <div className="hover:text-engage-black"></div>
      <div className="hover:text-engage-yellow"></div>
      <div className="hover:text-engage-blue"></div>
      <div className="hover:bg-engage-black"></div>
      <div className="hover:bg-engage-yellow"></div>
      <div className="hover:bg-engage-blue"></div>
    </div>
  );
};

export default ColorClasses;