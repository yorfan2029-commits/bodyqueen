/* =====================================================================
   BODY QUEEN · CONFIGURACIÓN DE LA TIENDA
   Este es el ÚNICO archivo que necesitas editar para cambiar precios,
   promociones, agotados, fotos, guía de tallas o datos de contacto.
   En GitHub: abre este archivo → ícono del lápiz → edita → "Commit changes".
   ===================================================================== */
window.BQ_CONFIG = {
  // Número que recibe los pedidos (con indicativo 57, solo números)
  whatsapp: "573128780976",
  whatsappVisible: "+57 312 878 0976",

  // Contacto opcional (déjalo "" si no aplica)
  email: "",
  horario: "",
  instagram: "", // ej. "https://instagram.com/tu_cuenta"
  facebook: "",
  tiktok: "",

  // Analítica opcional (déjalo "" hasta tenerlos)
  metaPixelId: "", // solo números
  googleAnalyticsId: "", // formato G-XXXXXXXXXX

  producto: {
    nombre: "Faja Quita Fácil de Control Abdominal",
    nombreCorto: "Faja Quita Fácil",
    descripcionCorta:
      "Soporte y compresión en abdomen, cintura y cadera. Diseño práctico para ir al baño con mayor facilidad.",
    descripcion: [
      "Faja Quita Fácil de control abdominal, diseñada para brindar soporte y compresión en la zona del abdomen, cintura y cadera.",
      "Su diseño práctico permite ir al baño con mayor facilidad sin necesidad de retirar completamente la prenda, ofreciendo comodidad durante el uso diario.",
    ],
    material: "Tela Suplex",
    precio: 69900, // precio de 1 unidad, en pesos, sin puntos
  },

  // Promociones por cantidad total (se pueden combinar colores y tallas)
  promociones: [
    { unidades: 2, precio: 119900, destacada: false },
    { unidades: 3, precio: 159900, destacada: true },
  ],

  colores: [
    { nombre: "Beige", muestra: "#D8BFA4" },
    { nombre: "Blanco", muestra: "#FFFFFF" },
    { nombre: "Negro", muestra: "#111111" },
  ],
  tallas: ["S", "M", "L", "XL", "2XL", "3XL"],

  // Combinaciones AGOTADAS. Escríbelas como "Color-Talla".
  // Ejemplo: agotados: ["Negro-S", "Blanco-3XL"],
  agotados: [],

  // Máximo de fajas por pedido
  maximoPorPedido: 12,

  // FOTOS: súbelas a la carpeta "fotos" y escribe aquí el nombre del archivo.
  // color: "Beige" | "Blanco" | "Negro" | "" (general, aparece con todos)
  // Mientras esta lista esté vacía se muestran espacios provisionales.
  fotos: [
    { archivo: "fotos/beige-frente.jpg", color: "Beige", descripcion: "Faja Quita Fácil color beige, vista frontal" },
    { archivo: "fotos/beige-espalda.jpg", color: "Beige", descripcion: "Faja Quita Fácil color beige, vista posterior" },
    { archivo: "fotos/negro-frente.jpg", color: "Negro", descripcion: "Faja Quita Fácil color negro, vista frontal" },
    { archivo: "fotos/negro-espalda.jpg", color: "Negro", descripcion: "Faja Quita Fácil color negro, vista posterior" },
  ],
  fotoPortada: "fotos/beige-frente.jpg", // si está vacío se usa la primera foto

  // Guía de tallas: completa con las medidas reales (déjalas "" si aún no las tienes)
  guiaTallas: [
    { talla: "S", cintura: "", cadera: "" },
    { talla: "M", cintura: "", cadera: "" },
    { talla: "L", cintura: "", cadera: "" },
    { talla: "XL", cintura: "", cadera: "" },
    { talla: "2XL", cintura: "", cadera: "" },
    { talla: "3XL", cintura: "", cadera: "" },
  ],

  // Testimonios REALES de clientas (con su autorización). Vacío = sección oculta.
  testimonios: [
    // { nombre: "Nombre", ciudad: "Ciudad", texto: "Opinión real de la clienta" },
  ],

  // Políticas: escribe el texto aprobado. Vacío = "En preparación".
  politicas: {
    privacidad: "",
    terminos: "",
    envios: "",
    cambios: "",
  },
};
