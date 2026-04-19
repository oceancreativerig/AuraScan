import React, { createContext, useContext, useState, ReactNode } from 'react';

export const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Portuguese', 'Russian'
];

type Translations = Record<string, Record<string, string>>;

export const translations: Translations = {
  "Language": {
    English: "Language", Spanish: "Idioma", French: "Langue", German: "Sprache", Chinese: "语言", Japanese: "言語", Hindi: "भाषा", Arabic: "اللغة", Portuguese: "Idioma", Russian: "Язык"
  },
  "History": {
    English: "History", Spanish: "Historial", French: "Historique", German: "Verlauf", Chinese: "历史", Japanese: "履歴", Hindi: "इतिहास", Arabic: "السجل", Portuguese: "Histórico", Russian: "История"
  },
  "Logout": {
    English: "Logout", Spanish: "Cerrar sesión", French: "Déconnexion", German: "Abmelden", Chinese: "登出", Japanese: "ログアウト", Hindi: "लॉग आउट", Arabic: "تسجيل الخروج", Portuguese: "Sair", Russian: "Выйти"
  },
  "Sign in to Save Scans": {
    English: "Sign in to Save Scans", Spanish: "Inicia sesión para guardar", French: "Connectez-vous pour enregistrer", German: "Anmelden zum Speichern", Chinese: "登录以保存扫描", Japanese: "ログインして保存", Hindi: "स्कैन सहेजने के लिए साइन इन करें", Arabic: "تسجيل الدخول لحفظ الفحوصات", Portuguese: "Faça login para salvar", Russian: "Войдите, чтобы сохранить"
  },
  "AI-Powered Biometrics": {
    English: "AI-Powered Biometrics", Spanish: "Biometría con IA", French: "Biométrie par IA", German: "KI-gestützte Biometrie", Chinese: "AI驱动的生物识别", Japanese: "AI搭載バイオメトリクス", Hindi: "एआई-संचालित बायोमेट्रिक्स", Arabic: "القياسات الحيوية المدعومة بالذكاء الاصطناعي", Portuguese: "Biometria com IA", Russian: "Биометрия на базе ИИ"
  },
  "Advanced facial analysis for full-body wellness insights and personalized health recommendations.": {
    English: "Advanced facial analysis for full-body wellness insights and personalized health recommendations.",
    Spanish: "Análisis facial avanzado para información de bienestar corporal y recomendaciones de salud.",
    French: "Analyse faciale avancée pour des informations sur le bien-être et des recommandations personnalisées.",
    German: "Erweiterte Gesichtsanalyse für ganzheitliche Wellness-Einblicke und personalisierte Empfehlungen.",
    Chinese: "先进的面部分析，提供全身健康洞察和个性化健康建议。",
    Japanese: "全身の健康状態の把握とパーソナライズされた健康推奨のための高度な顔分析。",
    Hindi: "पूर्ण-शरीर कल्याण अंतर्दृष्टि और व्यक्तिगत स्वास्थ्य सिफारिशों के लिए उन्नत चेहरे का विश्लेषण।",
    Arabic: "تحليل متقدم للوجه للحصول على رؤى صحية شاملة وتوصيات صحية مخصصة.",
    Portuguese: "Análise facial avançada para insights de bem-estar e recomendações de saúde personalizadas.",
    Russian: "Расширенный анализ лица для получения информации о здоровье и персональных рекомендаций."
  },
  "Daily Wellness Insight": {
    English: "Daily Wellness Insight", Spanish: "Consejo de bienestar diario", French: "Aperçu bien-être quotidien", German: "Täglicher Wellness-Einblick", Chinese: "每日健康洞察", Japanese: "毎日のウェルネスインサイト", Hindi: "दैनिक कल्याण अंतर्दृष्टि", Arabic: "رؤية العافية اليومية", Portuguese: "Insight Diário de Bem-Estar", Russian: "Ежедневный обзор здоровья"
  },
  "Based on your last scan, focus on": {
    English: "Based on your last scan, focus on", Spanish: "Según tu último escaneo, concéntrate en", French: "D'après votre dernier scan, concentrez-vous sur", German: "Basierend auf Ihrem letzten Scan, konzentrieren Sie sich auf", Chinese: "根据您上次的扫描，请关注", Japanese: "前回のスキャンに基づき、以下に注目してください：", Hindi: "आपके पिछले स्कैन के आधार पर, इस पर ध्यान दें:", Arabic: "بناءً على الفحص الأخير، ركز على", Portuguese: "Com base no seu último scan, foque em", Russian: "Основываясь на вашем последнем сканировании, сосредоточьтесь на"
  },
  "today.": {
    English: "today.", Spanish: "hoy.", French: "aujourd'hui.", German: "heute.", Chinese: "今天。", Japanese: "今日。", Hindi: "आज。", Arabic: "اليوم.", Portuguese: "hoje.", Russian: "сегодня."
  },
  "Start Health Scan": {
    English: "Start Health Scan", Spanish: "Iniciar escaneo de salud", French: "Démarrer le scan de santé", German: "Gesundheitsscan starten", Chinese: "开始健康扫描", Japanese: "ヘルススキャンを開始", Hindi: "स्वास्थ्य स्कैन शुरू करें", Arabic: "بدء الفحص الصحي", Portuguese: "Iniciar Scan de Saúde", Russian: "Начать сканирование здоровья"
  },
  "Requires camera access for facial analysis": {
    English: "Requires camera access for facial analysis", Spanish: "Requiere acceso a la cámara para el análisis facial", French: "Nécessite l'accès à la caméra pour l'analyse faciale", German: "Erfordert Kamerazugriff für die Gesichtsanalyse", Chinese: "需要相机权限以进行面部分析", Japanese: "顔分析にはカメラへのアクセスが必要です", Hindi: "चेहरे के विश्लेषण के लिए कैमरा एक्सेस की आवश्यकता है", Arabic: "يتطلب الوصول إلى الكاميرا لتحليل الوجه", Portuguese: "Requer acesso à câmera para análise facial", Russian: "Требуется доступ к камере для анализа лица"
  },
  "Accuracy Tip: Perfect Lighting": {
    English: "Accuracy Tip: Perfect Lighting", Spanish: "Consejo de precisión: Iluminación perfecta", French: "Astuce précision : Éclairage parfait", German: "Genauigkeits-Tipp: Perfekte Beleuchtung", Chinese: "准确度提示：完美的照明", Japanese: "精度のヒント：完璧な照明", Hindi: "सटीकता टिप: सही प्रकाश व्यवस्था", Arabic: "نصيحة الدقة: إضاءة مثالية", Portuguese: "Dica de Precisão: Iluminação Perfeita", Russian: "Совет по точности: Идеальное освещение"
  },
  "Face the Light": {
    English: "Face the Light", Spanish: "Mira hacia la luz", French: "Face à la lumière", German: "Ins Licht schauen", Chinese: "面向光源", Japanese: "光に向かって", Hindi: "प्रकाश का सामना करें", Arabic: "واجه الضوء", Portuguese: "Encare a Luz", Russian: "Лицом к свету"
  },
  "Position yourself towards a window or lamp.": {
    English: "Position yourself towards a window or lamp.", Spanish: "Posiciónate hacia una ventana o lámpara.", French: "Placez-vous face à une fenêtre ou une lampe.", German: "Positionieren Sie sich zu einem Fenster oder einer Lampe.", Chinese: "将自己面向窗户或灯光。", Japanese: "窓やランプの方を向いてください。", Hindi: "खुद को खिड़की या दीपक की ओर रखें।", Arabic: "ضع نفسك باتجاه نافذة أو مصباح.", Portuguese: "Posicione-se de frente para uma janela ou lâmpada.", Russian: "Встаньте лицом к окну или лампе."
  },
  "No Shadows": {
    English: "No Shadows", Spanish: "Sin sombras", French: "Pas d'ombres", German: "Keine Schatten", Chinese: "没有阴影", Japanese: "影がないこと", Hindi: "कोई छाया नहीं", Arabic: "بدون ظلال", Portuguese: "Sem Sombras", Russian: "Без теней"
  },
  "Ensure even lighting across your entire face.": {
    English: "Ensure even lighting across your entire face.", Spanish: "Asegura una iluminación uniforme en todo tu rostro.", French: "Assurez un éclairage uniforme sur tout votre visage.", German: "Sorgen Sie für eine gleichmäßige Beleuchtung Ihres gesamten Gesichts.", Chinese: "确保整个面部光线均匀。", Japanese: "顔全体に均等な光が当たるようにしてください。", Hindi: "सुनिश्चित करें कि आपके पूरे चेहरे पर समान प्रकाश हो।", Arabic: "تأكد من إضاءة متساوية على وجهك بالكامل.", Portuguese: "Garanta uma iluminação uniforme em todo o seu rosto.", Russian: "Обеспечьте равномерное освещение всего лица."
  },
  "Secure Analysis": {
    English: "Secure Analysis", Spanish: "Análisis seguro", French: "Analyse sécurisée", German: "Sichere Analyse", Chinese: "安全分析", Japanese: "安全な分析", Hindi: "सुरक्षित विश्लेषण", Arabic: "تحليل آمن", Portuguese: "Análise Segura", Russian: "Безопасный анализ"
  },
  "Your biometric data is processed securely and never stored on our servers.": {
    English: "Your biometric data is processed securely and never stored on our servers.", Spanish: "Tus datos biométricos se procesan de forma segura y nunca se almacenan.", French: "Vos données biométriques sont traitées de manière sécurisée et ne sont jamais stockées.", German: "Ihre biometrischen Daten werden sicher verarbeitet und nie gespeichert.", Chinese: "您的生物识别数据将被安全处理，且绝不会存储在我们的服务器上。", Japanese: "生体認証データは安全に処理され、サーバーに保存されることはありません。", Hindi: "आपके बायोमेट्रिक डेटा को सुरक्षित रूप से संसाधित किया जाता है और कभी भी संग्रहीत नहीं किया जाता है।", Arabic: "تتم معالجة بياناتك الحيوية بأمان ولا يتم تخزينها أبدًا على خوادمنا.", Portuguese: "Seus dados biométricos são processados com segurança e nunca armazenados.", Russian: "Ваши биометрические данные обрабатываются безопасно и никогда не сохраняются."
  },
  "Real-time Insights": {
    English: "Real-time Insights", Spanish: "Información en tiempo real", French: "Aperçus en temps réel", German: "Echtzeit-Einblicke", Chinese: "实时洞察", Japanese: "リアルタイムのインサイト", Hindi: "वास्तविक समय की अंतर्दृष्टि", Arabic: "رؤى في الوقت الفعلي", Portuguese: "Insights em Tempo Real", Russian: "Аналитика в реальном времени"
  },
  "Get instant feedback on hydration, stress, and vitality markers.": {
    English: "Get instant feedback on hydration, stress, and vitality markers.", Spanish: "Obtén comentarios instantáneos sobre hidratación, estrés y vitalidad.", French: "Obtenez des commentaires instantanés sur l'hydratation et le stress.", German: "Erhalten Sie sofortiges Feedback zu Hydratation, Stress und Vitalität.", Chinese: "获取有关水分、压力和活力指标的即时反馈。", Japanese: "水分補給、ストレス、活力マーカーに関する即時フィードバックを取得します。", Hindi: "हाइड्रेशन, तनाव और जीवन शक्ति मार्करों पर तत्काल प्रतिक्रिया प्राप्त करें।", Arabic: "احصل على ملاحظات فورية حول علامات الترطيب والتوتر والحيوية.", Portuguese: "Obtenha feedback instantâneo sobre hidratação, estresse e vitalidade.", Russian: "Получайте мгновенную обратную связь о гидратации, стрессе и жизненном тонусе."
  },
  "AI Wellness": {
    English: "AI Wellness", Spanish: "Bienestar con IA", French: "Bien-être IA", German: "KI-Wellness", Chinese: "AI健康", Japanese: "AIウェルネス", Hindi: "एआई वेलनेस", Arabic: "عافية الذكاء الاصطناعي", Portuguese: "Bem-estar com IA", Russian: "ИИ-Велнес"
  },
  "Personalized recommendations powered by advanced machine learning.": {
    English: "Personalized recommendations powered by advanced machine learning.", Spanish: "Recomendaciones personalizadas impulsadas por aprendizaje automático.", French: "Recommandations personnalisées alimentées par l'apprentissage automatique.", German: "Personalisierte Empfehlungen durch fortschrittliches maschinelles Lernen.", Chinese: "由高级机器学习驱动的个性化建议。", Japanese: "高度な機械学習によるパーソナライズされた推奨事項。", Hindi: "उन्नत मशीन लर्निंग द्वारा संचालित व्यक्तिगत सिफारिशें।", Arabic: "توصيات مخصصة مدعومة بالتعلم الآلي المتقدم.", Portuguese: "Recomendações personalizadas por aprendizado de máquina avançado.", Russian: "Персональные рекомендации на основе передового машинного обучения."
  },
  "Cancel Scan": {
    English: "Cancel Scan", Spanish: "Cancelar escaneo", French: "Annuler le scan", German: "Scan abbrechen", Chinese: "取消扫描", Japanese: "スキャンをキャンセル", Hindi: "स्कैन रद्द करें", Arabic: "إلغاء الفحص", Portuguese: "Cancelar Scan", Russian: "Отменить сканирование"
  },
  "Analysis Failed": {
    English: "Analysis Failed", Spanish: "Análisis fallido", French: "Échec de l'analyse", German: "Analyse fehlgeschlagen", Chinese: "分析失败", Japanese: "分析に失敗しました", Hindi: "विश्लेषण विफल", Arabic: "فشل التحليل", Portuguese: "Falha na Análise", Russian: "Ошибка анализа"
  },
  "Try Again": {
    English: "Try Again", Spanish: "Intentar de nuevo", French: "Réessayer", German: "Erneut versuchen", Chinese: "重试", Japanese: "もう一度お試しください", Hindi: "पुनः प्रयास करें", Arabic: "حاول مرة أخرى", Portuguese: "Tentar Novamente", Russian: "Попробовать снова"
  },
  "LOADING AI MODELS...": {
    English: "LOADING AI MODELS...", Spanish: "CARGANDO MODELOS DE IA...", French: "CHARGEMENT DES MODÈLES IA...", German: "LADE KI-MODELLE...", Chinese: "正在加载AI模型...", Japanese: "AIモデルを読み込み中...", Hindi: "एआई मॉडल लोड हो रहे हैं...", Arabic: "جاري تحميل نماذج الذكاء الاصطناعي...", Portuguese: "CARREGANDO MODELOS DE IA...", Russian: "ЗАГРУЗКА ИИ-МОДЕЛЕЙ..."
  },
  "INITIALIZING BIOMETRIC ENGINE...": {
    English: "INITIALIZING BIOMETRIC ENGINE...", Spanish: "INICIALIZANDO MOTOR BIOMÉTRICO...", French: "INITIALISATION DU MOTEUR BIOMÉTRIQUE...", German: "INITIALISIERE BIOMETRIE-ENGINE...", Chinese: "正在初始化生物识别引擎...", Japanese: "バイオメトリックエンジンを初期化中...", Hindi: "बायोमेट्रिक इंजन प्रारंभ हो रहा है...", Arabic: "جاري تهيئة محرك القياسات الحيوية...", Portuguese: "INICIALIZANDO MOTOR BIOMÉTRICO...", Russian: "ИНИЦИАЛИЗАЦИЯ БИОМЕТРИЧЕСКОГО ДВИЖКА..."
  },
  "DECODING BIOMETRICS": {
    English: "DECODING BIOMETRICS", Spanish: "DECODIFICANDO BIOMETRÍA", French: "DÉCODAGE DE LA BIOMÉTRIE", German: "DEKODIERE BIOMETRIE", Chinese: "解码生物特征", Japanese: "バイオメトリクスをデコード中", Hindi: "बायोमेट्रिक्स डिकोड कर रहा है", Arabic: "فك تشفير القياسات الحيوية", Portuguese: "DECODIFICANDO BIOMETRIA", Russian: "ДЕКОДИРОВАНИЕ БИОМЕТРИИ"
  },
  "Camera access denied. Please allow camera access in your browser settings/address bar and try again.": {
    English: "Camera access denied. Please allow camera access in your browser settings/address bar and try again.",
    Spanish: "Acceso a la cámara denegado. Permita el acceso en la configuración de su navegador y vuelva a intentarlo.",
    French: "Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur et réessayer.",
    German: "Kamerazugriff verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen und versuchen Sie es erneut.",
    Chinese: "无法访问相机。请在浏览器设置中允许访问相机，然后重试。",
    Japanese: "カメラへのアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを許可し、もう一度お試しください。",
    Hindi: "कैमरा एक्सेस अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग में कैमरा एक्सेस की अनुमति दें और पुनः प्रयास करें।",
    Arabic: "تم رفض الوصول إلى الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح والمحاولة مرة أخرى.",
    Portuguese: "Acesso à câmera negado. Permita o acesso na configuração do seu navegador e tente novamente.",
    Russian: "Доступ к камере запрещен. Пожалуйста, разрешите доступ к камере в настройках вашего браузера и повторите попытку."
  },
  "Camera permission was denied. Please click the camera icon in your browser address bar to allow access, then click Retry.": {
    English: "Camera permission was denied. Please click the camera icon in your browser address bar to allow access, then click Retry.",
    Spanish: "Permiso de cámara denegado. Haz clic en el icono de la cámara en la barra de direcciones para permitir el acceso.",
    French: "Autorisation caméra refusée. Cliquez sur l'icône caméra dans la barre d'adresse pour autoriser l'accès.",
    German: "Kameraberechtigung verweigert. Klicken Sie auf das Kamerasymbol in der Adressleiste, um den Zugriff zu erlauben.",
    Chinese: "相机权限被拒绝。请点击浏览器地址栏中的相机图标以允许访问。",
    Japanese: "カメラの権限が拒否されました。アドレスバーのカメラアイコンをクリックしてアクセスを許可してください。",
    Hindi: "कैमरा अनुमति अस्वीकृत। कृपया पहुंच की अनुमति देने के लिए ब्राउज़र एड्रेस बार में कैमरा आइकन पर क्लिक करें।",
    Arabic: "تم رفض إذن الكاميرا. يرجى النقر فوق أيقونة الكاميرا في شريط عنوان المتصفح للسماح بالوصول.",
    Portuguese: "Permissão de câmera negada. Clique no ícone da câmera na barra de endereços para permitir o acesso.",
    Russian: "В разрешении на использование камеры отказано. Нажмите на значок камеры в адресной строке браузера."
  },
  "No camera found on this device.": {
    English: "No camera found on this device.", Spanish: "No se encontró ninguna cámara.", French: "Aucune caméra trouvée.", German: "Keine Kamera gefunden.", Chinese: "未找到相机。", Japanese: "カメラが見つかりません。", Hindi: "कोई कैमरा नहीं मिला।", Arabic: "لم يتم العثور على كاميرا.", Portuguese: "Nenhuma câmera encontrada.", Russian: "Камера не найдена."
  },
  "Camera is already in use by another application.": {
    English: "Camera is already in use by another application.", Spanish: "La cámara ya está en uso.", French: "La caméra est déjà utilisée.", German: "Kamera wird bereits verwendet.", Chinese: "相机已被占用。", Japanese: "カメラは既に使用中です。", Hindi: "कैमरा पहले से ही उपयोग में है।", Arabic: "الكاميرا قيد الاستخدام بالفعل.", Portuguese: "A câmera já está em uso.", Russian: "Камера уже используется."
  },
  "Camera access is restricted in this preview. Please try opening the app in a new tab using the button below.": {
    English: "Camera access is restricted in this preview. Please try opening the app in a new tab using the button below.",
    Spanish: "El acceso a la cámara está restringido. Ábrelo en una nueva pestaña.",
    French: "L'accès à la caméra est restreint. Ouvrez dans un nouvel onglet.",
    German: "Kamerazugriff eingeschränkt. In neuem Tab öffnen.",
    Chinese: "此预览中相机访问受限。请使用下方按钮在新标签页中打开。",
    Japanese: "プレビューではカメラへのアクセスが制限されています。下のボタンから新しいタブで開いてください。",
    Hindi: "इस पूर्वावलोकन में कैमरा एक्सेस प्रतिबंधित है। कृपया नीचे दिए गए बटन का उपयोग करके नए टैब में खोलें।",
    Arabic: "الوصول إلى الكاميرا مقيد. يرجى المحاولة في علامة تبويب جديدة.",
    Portuguese: "O acesso à câmera está restrito. Abra em uma nova guia.",
    Russian: "Доступ к камере ограничен. Откройте в новой вкладке."
  },
  "Failed to load AI models. Please refresh.": {
    English: "Failed to load AI models. Please refresh.", Spanish: "Error al cargar modelos de IA. Por favor, actualiza.", French: "Échec du chargement des modèles IA. Veuillez rafraîchir.", German: "Fehler beim Laden der KI-Modelle. Bitte aktualisieren.", Chinese: "加载AI模型失败。请刷新。", Japanese: "AIモデルの読み込みに失敗しました。更新してください。", Hindi: "एआई मॉडल लोड करने में विफल। कृपया रीफ्रेश करें।", Arabic: "فشل تحميل نماذج الذكاء الاصطناعي. يرجى التحديث.", Portuguese: "Falha ao carregar modelos de IA. Atualize a página.", Russian: "Не удалось загрузить ИИ-модели. Пожалуйста, обновите страницу."
  },
  "Simulate Demo Scan": {
    English: "Simulate Demo Scan", Spanish: "Simular escaneo de demostración", French: "Simuler un scan de démonstration", German: "Demo-Scan simulieren", Chinese: "模拟演示扫描", Japanese: "デモスキャンをシミュレート", Hindi: "डेमो स्कैन का अनुकरण करें", Arabic: "محاكاة مسح تجريبي", Portuguese: "Simular Scan de Demonstração", Russian: "Симулировать демонстрационное сканирование"
  },
  "Scan Restricted: Camera permission was denied. To continue, please enable camera access in your browser settings (look for the camera icon in the address bar) and click Retry.": {
    English: "Scan Restricted: Camera permission was denied. To continue, please enable camera access in your browser settings (look for the camera icon in the address bar) and click Retry.",
    Spanish: "Escaneo restringido: se denegó el permiso de la cámara. Habilite el acceso en la configuración y haga clic en Reintentar.",
    French: "Scan restreint : l'autorisation de la caméra a été refusée. Veuillez activer l'accès dans les paramètres et cliquer sur Réessayer.",
    German: "Scan eingeschränkt: Kameraberechtigung wurde verweigert. Bitte aktivieren Sie den Zugriff in den Einstellungen und klicken Sie auf Wiederholen.",
    Chinese: "扫描受限：相机权限被拒绝。请在浏览器设置中启用相机访问，然后点击重试。",
    Japanese: "スキャンが制限されています：カメラの権限が拒否されました。ブラウザの設定でカメラへのアクセスを有効にし、再試行をクリックしてください。",
    Hindi: "स्कैन प्रतिबंधित: कैमरा अनुमति अस्वीकृत कर दी गई थी। जारी रखने के लिए, कृपया ब्राउज़र सेटिंग्स में कैमरा एक्सेस सक्षम करें और पुनः प्रयास करें।",
    Arabic: "المسح مقيد: تم رفض إذن الكاميرا. للمتابعة ، يرجى تمكين الوصول إلى الكاميرا في إعدادات المتصفح والنقر فوق إعادة المحاولة.",
    Portuguese: "Scan Restrito: A permissão da câmera foi negada. Para continuar, habilite o acesso à câmera nas configurações do navegador e clique em Tentar Novamente.",
    Russian: "Сканирование ограничено: в разрешении на использование камеры отказано. Чтобы продолжить, включите доступ к камере в настройках браузера и нажмите «Повторить»."
  },
  "AuraScan requires deep biometric sensor access which is restricted in this preview. Please use the button below to 'Open in New Tab' for full access, or upload a high-quality photo manually.": {
    English: "AuraScan requires deep biometric sensor access which is restricted in this preview. Please use the button below to 'Open in New Tab' for full access, or upload a high-quality photo manually.",
    Spanish: "AuraScan requiere acceso al sensor biométrico. Usa 'Abrir en nueva pestaña' o sube una foto.",
    French: "AuraScan nécessite un accès au capteur biométrique. Utilisez 'Ouvrir dans un nouvel onglet' ou téléchargez une photo.",
    German: "AuraScan erfordert Zugriff auf biometrische Sensoren. 'In neuem Tab öffnen' oder Foto hochladen.",
    Chinese: "AuraScan 需要深层生物识别传感器访问权限，该权限在预览中受限。请使用下方的“在新标签页中打开”按钮以获得完整访问权限，或手动上传高质量照片。",
    Japanese: "AuraScanにはバイオメトリックセンサーへのフルアクセスが必要ですが、プレビューでは制限されています。下のボタンから「新しいタブで開く」か、手動で写真をアップロードしてください。",
    Hindi: "AuraScan के लिए गहरे बायोमेट्रिक सेंसर एक्सेस की आवश्यकता होती है जो इस पूर्वावलोकन में प्रतिबंधित है। कृपया पूर्ण पहुंच के लिए नीचे दिए गए बटन का उपयोग करें, या मैन्युअल रूप से एक फोटो अपलोड करें।",
    Arabic: "يتطلب AuraScan وصولاً عميقًا إلى المستشعر البيومتري وهو مقيد في هذه المعاينة. يرجى استخدام الزر أدناه لـ 'فتح في علامة تبويب جديدة' للوصول الكامل ، أو تحميل صورة عالية الجودة يدويًا.",
    Portuguese: "O AuraScan requer acesso profundo ao sensor biométrico, o que é restrito nesta visualização. Use o botão abaixo para 'Abrir em nova guia' ou envie uma foto manualmente.",
    Russian: "AuraScan требует глубокого доступа к биометрическим датчикам, который ограничен в этом режиме. Используйте кнопку «Открыть в новой вкладке» для полного доступа или загрузите фото вручную."
  },
  "Too dark for accurate scan": {
    English: "Too dark for accurate scan", Spanish: "Demasiado oscuro para un escaneo preciso", French: "Trop sombre pour un scan précis", German: "Zu dunkel für einen genauen Scan", Chinese: "太暗，无法进行准确扫描", Japanese: "暗すぎて正確なスキャンができません", Hindi: "सटीक स्कैन के लिए बहुत अंधेरा", Arabic: "مظلم جدًا لإجراء فحص دقيق", Portuguese: "Muito escuro para um scan preciso", Russian: "Слишком темно для точного сканирования"
  },
  "Warning: Environment too dark": {
    English: "Warning: Environment too dark", Spanish: "Advertencia: Entorno demasiado oscuro", French: "Avertissement : Environnement trop sombre", German: "Warnung: Umgebung zu dunkel", Chinese: "警告：环境太暗", Japanese: "警告：環境が暗すぎます", Hindi: "चेतावनी: पर्यावरण बहुत अंधेरा है", Arabic: "تحذير: البيئة مظلمة جدًا", Portuguese: "Aviso: Ambiente muito escuro", Russian: "Предупреждение: Слишком темно"
  },
  "Lighting: Optimal for analysis": {
    English: "Lighting: Optimal for analysis", Spanish: "Iluminación: Óptima para el análisis", French: "Éclairage : Optimal pour l'analyse", German: "Beleuchtung: Optimal für die Analyse", Chinese: "照明：最适合分析", Japanese: "照明：分析に最適", Hindi: "प्रकाश व्यवस्था: विश्लेषण के लिए इष्टतम", Arabic: "الإضاءة: مثالية للتحليل", Portuguese: "Iluminação: Ideal para análise", Russian: "Освещение: Оптимально для анализа"
  },
  "Analysis Complete": {
    English: "Analysis Complete", Spanish: "Análisis completo", French: "Analyse terminée", German: "Analyse abgeschlossen", Chinese: "分析完成", Japanese: "分析完了", Hindi: "विश्लेषण पूर्ण", Arabic: "اكتمل التحليل", Portuguese: "Análise Concluída", Russian: "Анализ завершен"
  },
  "AuraScan Biometric Report": {
    English: "AuraScan Biometric Report", Spanish: "Informe biométrico de AuraScan", French: "Rapport biométrique AuraScan", German: "AuraScan Biometrischer Bericht", Chinese: "AuraScan生物识别报告", Japanese: "AuraScanバイオメトリクスレポート", Hindi: "AuraScan बायोमेट्रिक रिपोर्ट", Arabic: "تقرير القياسات الحيوية AuraScan", Portuguese: "Relatório Biométrico AuraScan", Russian: "Биометрический отчет AuraScan"
  },
  "Confidence": {
    English: "Confidence", Spanish: "Confianza", French: "Confiance", German: "Konfidenz", Chinese: "置信度", Japanese: "信頼度", Hindi: "आत्मविश्वास", Arabic: "الثقة", Portuguese: "Confiança", Russian: "Уверенность"
  },
  "Personalized Recommendations": {
    English: "Personalized Recommendations", Spanish: "Recomendaciones personalizadas", French: "Recommandations personnalisées", German: "Personalisierte Empfehlungen", Chinese: "个性化建议", Japanese: "パーソナライズされた推奨事項", Hindi: "व्यक्तिगत सिफारिशें", Arabic: "توصيات مخصصة", Portuguese: "Recomendações Personalizadas", Russian: "Персональные рекомендации"
  },
  "Action Plan": {
    English: "Action Plan", Spanish: "Plan de acción", French: "Plan d'action", German: "Aktionsplan", Chinese: "行动计划", Japanese: "アクションプラン", Hindi: "कार्य योजना", Arabic: "خطة العمل", Portuguese: "Plano de Ação", Russian: "План действий"
  },
  "DAY": {
    English: "DAY", Spanish: "DÍA", French: "JOUR", German: "TAG", Chinese: "天", Japanese: "日", Hindi: "दिन", Arabic: "يوم", Portuguese: "DIA", Russian: "ДЕНЬ"
  },
  "Medical Disclaimer": {
    English: "Medical Disclaimer", Spanish: "Aviso médico", French: "Avis médical", German: "Medizinischer Haftungsausschluss", Chinese: "医疗免责声明", Japanese: "医療免責事項", Hindi: "चिकित्सा अस्वीकरण", Arabic: "إخلاء المسؤولية الطبية", Portuguese: "Aviso Médico", Russian: "Медицинский отказ от ответственности"
  },
  "AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.": {
    English: "AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
    Spanish: "AuraScan es una herramienta de bienestar impulsada por IA y no sustituye el consejo, diagnóstico o tratamiento médico profesional. Siempre busca el consejo de tu médico u otro proveedor de salud calificado con cualquier pregunta que puedas tener sobre una condición médica.",
    French: "AuraScan est un outil de bien-être alimenté par l'IA et ne remplace pas les conseils, diagnostics ou traitements médicaux professionnels. Demandez toujours l'avis de votre médecin ou d'un autre professionnel de la santé qualifié pour toute question concernant un problème de santé.",
    German: "AuraScan ist ein KI-gestütztes Wellness-Tool und kein Ersatz für professionelle medizinische Beratung, Diagnose oder Behandlung. Suchen Sie bei Fragen zu einer Krankheit immer den Rat Ihres Arztes oder eines anderen qualifizierten Gesundheitsdienstleisters.",
    Chinese: "AuraScan是一款由AI驱动的健康工具，不能替代专业的医疗建议、诊断或治疗。如果您对医疗状况有任何疑问，请务必寻求您的医生或其他合格的医疗服务提供者的建议。",
    Japanese: "AuraScanはAIを活用したウェルネスツールであり、専門的な医学的アドバイス、診断、または治療に代わるものではありません。病状に関する質問がある場合は、常に医師または他の資格のある医療提供者のアドバイスを求めてください。",
    Hindi: "AuraScan एक AI-संचालित वेलनेस टूल है और यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है। किसी भी चिकित्सा स्थिति के संबंध में किसी भी प्रश्न के लिए हमेशा अपने चिकित्सक या अन्य योग्य स्वास्थ्य प्रदाता की सलाह लें।",
    Arabic: "AuraScan هي أداة عافية مدعومة بالذكاء الاصطناعي وليست بديلاً عن الاستشارة الطبية المتخصصة أو التشخيص أو العلاج. اطلب دائمًا نصيحة طبيبك أو غيره من مقدمي الرعاية الصحية المؤهلين بشأن أي أسئلة قد تكون لديك بخصوص حالة طبية.",
    Portuguese: "O AuraScan é uma ferramenta de bem-estar com tecnologia de IA e não substitui aconselhamento, diagnóstico ou tratamento médico profissional. Procure sempre o conselho do seu médico ou outro profissional de saúde qualificado com qualquer dúvida que possa ter sobre uma condição médica.",
    Russian: "AuraScan — это инструмент для здоровья на базе ИИ, который не заменяет профессиональную медицинскую консультацию, диагностику или лечение. Всегда обращайтесь за советом к своему врачу или другому квалифицированному медицинскому работнику по любым вопросам, касающимся состояния здоровья."
  },
  "Scan Again": {
    English: "Scan Again", Spanish: "Escanear de nuevo", French: "Scanner à nouveau", German: "Erneut scannen", Chinese: "再次扫描", Japanese: "再スキャン", Hindi: "फिर से स्कैन करें", Arabic: "مسح مرة أخرى", Portuguese: "Escanear Novamente", Russian: "Сканировать снова"
  },
  "Score": {
    English: "Score", Spanish: "Puntuación", French: "Score", German: "Punktzahl", Chinese: "分数", Japanese: "スコア", Hindi: "स्कोर", Arabic: "النتيجة", Portuguese: "Pontuação", Russian: "Оценка"
  },
  "Back to Scanner": {
    English: "Back to Scanner", Spanish: "Volver al escáner", French: "Retour au scanner", German: "Zurück zum Scanner", Chinese: "返回扫描仪", Japanese: "スキャナーに戻る", Hindi: "स्कैनर पर वापस", Arabic: "العودة إلى الماسح الضوئي", Portuguese: "Voltar ao Scanner", Russian: "Назад к сканеру"
  },
  "Scan History": {
    English: "Scan History", Spanish: "Historial de escaneo", French: "Historique des scans", German: "Scan-Verlauf", Chinese: "扫描历史", Japanese: "スキャン履歴", Hindi: "स्कैन इतिहास", Arabic: "سجل الفحص", Portuguese: "Histórico de Scans", Russian: "История сканирований"
  },
  "Loading history...": {
    English: "Loading history...", Spanish: "Cargando historial...", French: "Chargement de l'historique...", German: "Lade Verlauf...", Chinese: "正在加载历史记录...", Japanese: "履歴を読み込み中...", Hindi: "इतिहास लोड हो रहा है...", Arabic: "جاري تحميل السجل...", Portuguese: "Carregando histórico...", Russian: "Загрузка истории..."
  },
  "No scans found. Start your first health scan!": {
    English: "No scans found. Start your first health scan!", Spanish: "No se encontraron escaneos. ¡Inicia tu primer escaneo de salud!", French: "Aucun scan trouvé. Commencez votre premier scan de santé !", German: "Keine Scans gefunden. Starten Sie Ihren ersten Gesundheitsscan!", Chinese: "未找到扫描。开始您的第一次健康扫描！", Japanese: "スキャンが見つかりません。最初のヘルススキャンを開始してください！", Hindi: "कोई स्कैन नहीं मिला। अपना पहला स्वास्थ्य स्कैन शुरू करें!", Arabic: "لم يتم العثور على فحوصات. ابدأ فحصك الصحي الأول!", Portuguese: "Nenhum scan encontrado. Inicie seu primeiro scan de saúde!", Russian: "Сканирования не найдены. Начните свое первое сканирование здоровья!"
  },
  "Recent": {
    English: "Recent", Spanish: "Reciente", French: "Récent", German: "Kürzlich", Chinese: "最近", Japanese: "最近", Hindi: "हाल का", Arabic: "الأخيرة", Portuguese: "Recente", Russian: "Недавние"
  },
  "Wellness Trends": {
    English: "Wellness Trends", Spanish: "Tendencias de bienestar", French: "Tendances bien-être", German: "Wellness-Trends", Chinese: "健康趋势", Japanese: "ウェルネストレンド", Hindi: "कल्याण रुझान", Arabic: "اتجاهات العافية", Portuguese: "Tendências de Bem-Estar", Russian: "Тенденции здоровья"
  },
  "Score progression over time": {
    English: "Score progression over time", Spanish: "Progresión de la puntuación a lo largo del tiempo", French: "Progression du score dans le temps", German: "Punkteentwicklung im Laufe der Zeit", Chinese: "随时间推移的分数进展", Japanese: "時間の経過に伴うスコアの推移", Hindi: "समय के साथ स्कोर की प्रगति", Arabic: "تطور النتيجة بمرور الوقت", Portuguese: "Progressão da pontuação ao longo do tempo", Russian: "Динамика оценки с течением времени"
  },
  "Average Score": {
    English: "Average Score", Spanish: "Puntuación media", French: "Score moyen", German: "Durchschnittliche Punktzahl", Chinese: "平均分", Japanese: "平均スコア", Hindi: "औसत स्कोर", Arabic: "متوسط النتيجة", Portuguese: "Pontuação Média", Russian: "Средний балл"
  },
  "Forehead": {
    English: "Forehead", Spanish: "Frente", French: "Front", German: "Stirn", Chinese: "额头", Japanese: "額", Hindi: "माथा", Arabic: "الجبهة", Portuguese: "Testa", Russian: "Лоб"
  },
  "Eyes": {
    English: "Eyes", Spanish: "Ojos", French: "Yeux", German: "Augen", Chinese: "眼睛", Japanese: "目", Hindi: "आंखें", Arabic: "العيون", Portuguese: "Olhos", Russian: "Глаза"
  },
  "Nose": {
    English: "Nose", Spanish: "Nariz", French: "Nez", German: "Nase", Chinese: "鼻子", Japanese: "鼻", Hindi: "नाक", Arabic: "الأنف", Portuguese: "Nariz", Russian: "Нос"
  },
  "Cheeks": {
    English: "Cheeks", Spanish: "Mejillas", French: "Joues", German: "Wangen", Chinese: "脸颊", Japanese: "頬", Hindi: "गाल", Arabic: "الخدين", Portuguese: "Bochechas", Russian: "Щеки"
  },
  "Mouth": {
    English: "Mouth", Spanish: "Boca", French: "Bouche", German: "Mund", Chinese: "嘴巴", Japanese: "口", Hindi: "मुंह", Arabic: "الفم", Portuguese: "Boca", Russian: "Рот"
  },
  "Jawline": {
    English: "Jawline", Spanish: "Mandíbula", French: "Mâchoire", German: "Kieferpartie", Chinese: "下颌线", Japanese: "顎のライン", Hindi: "जबड़े की रेखा", Arabic: "خط الفك", Portuguese: "Mandíbula", Russian: "Линия подбородка"
  },
  "optimal": {
    English: "optimal", Spanish: "óptimo", French: "optimal", German: "optimal", Chinese: "最佳", Japanese: "最適", Hindi: "इष्टतम", Arabic: "أمثل", Portuguese: "ideal", Russian: "оптимально"
  },
  "fair": {
    English: "fair", Spanish: "regular", French: "passable", German: "befriedigend", Chinese: "一般", Japanese: "普通", Hindi: "निष्पक्ष", Arabic: "مقبول", Portuguese: "razoável", Russian: "удовлетворительно"
  },
  "attention needed": {
    English: "attention needed", Spanish: "necesita atención", French: "attention requise", German: "Aufmerksamkeit erforderlich", Chinese: "需要注意", Japanese: "注意が必要", Hindi: "ध्यान देने की आवश्यकता है", Arabic: "بحاجة للاهتمام", Portuguese: "requer atenção", Russian: "требует внимания"
  },
  "Login failed. Please ensure your domain is added to Firebase Authorized Domains.": {
    English: "Login failed. Please ensure your domain is added to Firebase Authorized Domains.",
    Spanish: "Error de inicio de sesión. Asegúrate de que tu dominio esté agregado a los dominios autorizados de Firebase.",
    French: "Échec de la connexion. Veuillez vous assurer que votre domaine est ajouté aux domaines autorisés de Firebase.",
    German: "Anmeldung fehlgeschlagen. Bitte stellen Sie sicher, dass Ihre Domain zu den autorisierten Firebase-Domains hinzugefügt wurde.",
    Chinese: "登录失败。请确保您的域已添加到Firebase授权域中。",
    Japanese: "ログインに失敗しました。ドメインがFirebaseの承認済みドメインに追加されていることを確認してください。",
    Hindi: "लॉगिन विफल। कृपया सुनिश्चित करें कि आपका डोमेन फायरबेस अधिकृत डोमेन में जोड़ा गया है।",
    Arabic: "فشل تسجيل الدخول. يرجى التأكد من إضافة نطاقك إلى نطاقات Firebase المعتمدة.",
    Portuguese: "Falha no login. Certifique-se de que seu domínio foi adicionado aos Domínios Autorizados do Firebase.",
    Russian: "Ошибка входа. Убедитесь, что ваш домен добавлен в авторизованные домены Firebase."
  },
  "Analysis failed. Please try again.": {
    English: "Analysis failed. Please try again.",
    Spanish: "El análisis falló. Por favor, inténtalo de nuevo.",
    French: "L'analyse a échoué. Veuillez réessayer.",
    German: "Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.",
    Chinese: "分析失败。请重试。",
    Japanese: "分析に失敗しました。もう一度お試しください。",
    Hindi: "विश्लेषण विफल रहा। कृपया पुनः प्रयास करें।",
    Arabic: "فشل التحليل. يرجى المحاولة مرة أخرى.",
    Portuguese: "A análise falhou. Por favor, tente novamente.",
    Russian: "Анализ не удался. Пожалуйста, попробуйте еще раз."
  },
  "© 2026 AuraScan Biometrics • For Informational Purposes Only": {
    English: "© 2026 AuraScan Biometrics • For Informational Purposes Only",
    Spanish: "© 2026 AuraScan Biometrics • Solo con fines informativos",
    French: "© 2026 AuraScan Biometrics • À des fins d'information uniquement",
    German: "© 2026 AuraScan Biometrics • Nur zu Informationszwecken",
    Chinese: "© 2026 AuraScan Biometrics • 仅供参考",
    Japanese: "© 2026 AuraScan Biometrics • 情報提供のみを目的としています",
    Hindi: "© 2026 AuraScan Biometrics • केवल सूचना के उद्देश्यों के लिए",
    Arabic: "© 2026 AuraScan Biometrics • للأغراض الإعلامية فقط",
    Portuguese: "© 2026 AuraScan Biometrics • Apenas para fins informativos",
    Russian: "© 2026 AuraScan Biometrics • Только для информационных целей"
  },
  "Feedback": {
    English: "Feedback", Spanish: "Comentarios", French: "Commentaires", German: "Feedback", Chinese: "反馈", Japanese: "フィードバック", Hindi: "प्रतिक्रिया", Arabic: "التعليقات", Portuguese: "Feedback", Russian: "Обратная связь"
  },
  "Help us improve AuraScan": {
    English: "Help us improve AuraScan", Spanish: "Ayúdanos a mejorar AuraScan", French: "Aidez-nous à améliorer AuraScan", German: "Helfen Sie uns, AuraScan zu verbessern", Chinese: "帮助我们改进AuraScan", Japanese: "AuraScanの改善にご協力ください", Hindi: "AuraScan को बेहतर बनाने में हमारी मदद करें", Arabic: "ساعدنا في تحسين AuraScan", Portuguese: "Ajude-nos a melhorar o AuraScan", Russian: "Помогите нам улучшить AuraScan"
  },
  "Your feedback": {
    English: "Your feedback", Spanish: "Tus comentarios", French: "Vos commentaires", German: "Ihr Feedback", Chinese: "您的反馈", Japanese: "あなたのフィードバック", Hindi: "आपकी प्रतिक्रिया", Arabic: "رأيك", Portuguese: "Seu feedback", Russian: "Ваш отзыв"
  },
  "Tell us what you think or report an issue...": {
    English: "Tell us what you think or report an issue...", Spanish: "Cuéntanos qué piensas o informa un problema...", French: "Dites-nous ce que vous en pensez ou signalez un problème...", German: "Sagen Sie uns Ihre Meinung oder melden Sie ein Problem...", Chinese: "告诉我们您的想法或报告问题...", Japanese: "ご意見をお聞かせいただくか、問題を報告してください...", Hindi: "हमें बताएं कि आप क्या सोचते हैं या किसी समस्या की रिपोर्ट करें...", Arabic: "أخبرنا برأيك أو أبلغ عن مشكلة...", Portuguese: "Diga-nos o que você acha ou relate um problema...", Russian: "Расскажите нам, что вы думаете, или сообщите о проблеме..."
  },
  "Submit Feedback": {
    English: "Submit Feedback", Spanish: "Enviar comentarios", French: "Envoyer les commentaires", German: "Feedback absenden", Chinese: "提交反馈", Japanese: "フィードバックを送信", Hindi: "प्रतिक्रिया सबमिट करें", Arabic: "إرسال التعليقات", Portuguese: "Enviar Feedback", Russian: "Отправить отзыв"
  },
  "Cancel": {
    English: "Cancel", Spanish: "Cancelar", French: "Annuler", German: "Abbrechen", Chinese: "取消", Japanese: "キャンセル", Hindi: "रद्द करें", Arabic: "إلغاء", Portuguese: "Cancelar", Russian: "Отмена"
  },
  "Thank you for your feedback!": {
    English: "Thank you for your feedback!", Spanish: "¡Gracias por tus comentarios!", French: "Merci pour vos commentaires !", German: "Vielen Dank für Ihr Feedback!", Chinese: "感谢您的反馈！", Japanese: "フィードバックをありがとうございました！", Hindi: "आपकी प्रतिक्रिया के लिए धन्यवाद!", Arabic: "شكرا لك على ملاحظاتك!", Portuguese: "Obrigado pelo seu feedback!", Russian: "Спасибо за ваш отзыв!"
  },
  "Select Focus Area": {
    English: "Select Focus Area", Spanish: "Seleccionar área de enfoque", French: "Sélectionner la zone de concentration", German: "Fokusbereich auswählen", Chinese: "选择重点区域", Japanese: "重点領域を選択", Hindi: "फोकस क्षेत्र चुनें", Arabic: "حدد منطقة التركيز", Portuguese: "Selecionar Área de Foco", Russian: "Выберите область внимания"
  },
  "General Wellness": {
    English: "General Wellness", Spanish: "Bienestar general", French: "Bien-être général", German: "Allgemeines Wohlbefinden", Chinese: "一般健康", Japanese: "一般的なウェルネス", Hindi: "सामान्य कल्याण", Arabic: "العافية العامة", Portuguese: "Bem-estar Geral", Russian: "Общее самочувствие"
  },
  "Skin & Aging": {
    English: "Skin & Aging", Spanish: "Piel y envejecimiento", French: "Peau et vieillissement", German: "Haut & Alterung", Chinese: "皮肤与抗衰老", Japanese: "肌とエイジング", Hindi: "त्वचा और उम्र बढ़ना", Arabic: "البشرة والشيخوخة", Portuguese: "Pele e Envelhecimento", Russian: "Кожа и старение"
  },
  "Cardiovascular Health": {
    English: "Cardiovascular Health", Spanish: "Salud cardiovascular", French: "Santé cardiovasculaire", German: "Herz-Kreislauf-Gesundheit", Chinese: "心血管健康", Japanese: "心血管の健康", Hindi: "हृदय स्वास्थ्य", Arabic: "صحة القلب والأوعية الدموية", Portuguese: "Saúde Cardiovascular", Russian: "Сердечно-сосудистое здоровье"
  },
  "Stress & Fatigue": {
    English: "Stress & Fatigue", Spanish: "Estrés y fatiga", French: "Stress et fatigue", German: "Stress & Müdigkeit", Chinese: "压力与疲劳", Japanese: "ストレスと疲労", Hindi: "तनाव और थकान", Arabic: "التوتر والإرهاق", Portuguese: "Estresse e Fadiga", Russian: "Стресс и усталость"
  },
  "Digestive Health": {
    English: "Digestive Health", Spanish: "Salud digestiva", French: "Santé digestive", German: "Verdauungsgesundheit", Chinese: "消化健康", Japanese: "消化器系の健康", Hindi: "पाचन स्वास्थ्य", Arabic: "صحة الجهاز الهضمي", Portuguese: "Saúde Digestiva", Russian: "Пищеварительное здоровье"
  },
  "Immune System": {
    English: "Immune System", Spanish: "Sistema inmunológico", French: "Système immunitaire", German: "Immunsystem", Chinese: "免疫系统", Japanese: "免疫システム", Hindi: "प्रतिरक्षा प्रणाली", Arabic: "جهاز المناعة", Portuguese: "Sistema Imunológico", Russian: "Иммунная система"
  },
  "Upload Photo Instead": {
    English: "Upload Photo Instead", Spanish: "Subir foto en su lugar", French: "Télécharger une photo à la place", German: "Stattdessen Foto hochladen", Chinese: "改为上传照片", Japanese: "代わりに写真をアップロード", Hindi: "इसके बजाय फ़ोटो अपलोड करें", Arabic: "تحميل صورة بدلاً من ذلك", Portuguese: "Enviar foto em vez disso", Russian: "Загрузить фото вместо этого"
  },
  "Progress": {
    English: "Progress", Spanish: "Progreso", French: "Progrès", German: "Fortschritt", Chinese: "进度", Japanese: "進捗", Hindi: "प्रगति", Arabic: "التقدم", Portuguese: "Progresso", Russian: "Прогресс"
  },
  "Please ensure this domain is added to Firebase Authorized Domains:": {
    English: "Please ensure this domain is added to Firebase Authorized Domains:", Spanish: "Asegúrese de que este dominio esté agregado a los dominios autorizados de Firebase:", French: "Veuillez vous assurer que ce domaine est ajouté aux domaines autorisés Firebase :", German: "Bitte stellen Sie sicher, dass diese Domain zu den autorisierten Firebase-Domains hinzugefügt wurde:", Chinese: "请确保此域名已添加到 Firebase 授权域名中：", Japanese: "このドメインが Firebase の承認済みドメインに追加されていることを確認してください:", Hindi: "कृपया सुनिश्चित करें कि यह डोमेन Firebase अधिकृत डोमेन में जोड़ा गया है:", Arabic: "يرجى التأكد من إضافة هذا النطاق إلى نطاقات Firebase المعتمدة:", Portuguese: "Certifique-se de que este domínio foi adicionado aos Domínios Autorizados do Firebase:", Russian: "Убедитесь, что этот домен добавлен в список разрешенных доменов Firebase:"
  },
  "Admin": {
    English: "Admin", Spanish: "Administrador", French: "Admin", German: "Admin", Chinese: "管理员", Japanese: "管理者", Hindi: "व्यवस्थापक", Arabic: "المشرف", Portuguese: "Admin", Russian: "Админ"
  },
  "Admin Control Panel": {
    English: "Admin Control Panel", Spanish: "Panel de control del administrador", French: "Panneau de configuration de l'administrateur", German: "Admin-Kontrollzentrum", Chinese: "管理员控制面板", Japanese: "管理者コントロールパネル", Hindi: "व्यवस्थापक नियंत्रण कक्ष", Arabic: "لوحة تحكم المشرف", Portuguese: "Painel de Controle do Administrador", Russian: "Панель управления администратора"
  },
  "Total Scans": {
    English: "Total Scans", Spanish: "Escaneos totales", French: "Total des scans", German: "Gesamtscans", Chinese: "总扫描次数", Japanese: "総スキャン数", Hindi: "कुल स्कैन", Arabic: "إجمالي عمليات المسح", Portuguese: "Total de Scans", Russian: "Всего сканирований"
  },
  "API & System": {
    English: "API & System", Spanish: "API y sistema", French: "API et système", German: "API & System", Chinese: "API与系统", Japanese: "APIとシステム", Hindi: "एपीआई और सिस्टम", Arabic: "واجهة برمجة التطبيقات والنظام", Portuguese: "API e Sistema", Russian: "API и система"
  },
  "Gemini AI API Status": {
    English: "Gemini AI API Status", Spanish: "Estado de la API de Gemini AI", French: "Statut de l'API Gemini AI", German: "Gemini AI API Status", Chinese: "Gemini AI API状态", Japanese: "Gemini AI APIステータス", Hindi: "जेमिनी एआई एपीआई स्थिति", Arabic: "حالة واجهة برمجة تطبيقات Gemini AI", Portuguese: "Status da API Gemini AI", Russian: "Статус Gemini AI API"
  },
  "API Configuration": {
    English: "API Configuration", Spanish: "Configuración de API", French: "Configuration de l'API", German: "API-Konfiguration", Chinese: "API配置", Japanese: "API設定", Hindi: "एपीआई कॉन्फ़िगरेशन", Arabic: "تكوين واجهة برمجة التطبيقات", Portuguese: "Configuração da API", Russian: "Конфигурация API"
  },
  "Active & Connected": {
    English: "Active & Connected", Spanish: "Activo y conectado", French: "Actif et connecté", German: "Aktiv & Verbunden", Chinese: "已激活并连接", Japanese: "アクティブで接続済み", Hindi: "सक्रिय और जुड़ा हुआ", Arabic: "نشط ومتصل", Portuguese: "Ativo e Conectado", Russian: "Активен и подключен"
  },
  "Current Model": {
    English: "Current Model", Spanish: "Modelo actual", French: "Modèle actuel", German: "Aktuelles Modell", Chinese: "当前模型", Japanese: "現在のモデル", Hindi: "वर्तमान मॉडल", Arabic: "النموذج الحالي", Portuguese: "Modelo Atual", Russian: "Текущая модель"
  },
  "Estimated Balance": {
    English: "Estimated Balance", Spanish: "Saldo estimado", French: "Solde estimé", German: "Geschätztes Guthaben", Chinese: "预估余额", Japanese: "推定残高", Hindi: "अनुमानित शेष", Arabic: "الرصيد التقديري", Portuguese: "Saldo Estimado", Russian: "Оценочный баланс"
  },
  "UNLIMITED PREVIEW": {
    English: "UNLIMITED PREVIEW", Spanish: "VISTA PREVIA ILIMITADA", French: "APERÇU ILLIMITÉ", German: "UNBEGRENZTE VORSCHAU", Chinese: "无限预览", Japanese: "無制限プレビュー", Hindi: "असीमित पूर्वावलोकन", Arabic: "معاينة غير محدودة", Portuguese: "PRÉ-VISUALIZAÇÃO ILIMITADA", Russian: "НЕОГРАНИЧЕННЫЙ ПРОСМОТР"
  },
  "Usage Insights": {
    English: "Usage Insights", Spanish: "Información de uso", French: "Aperçu de l'utilisation", German: "Nutzungseinblicke", Chinese: "使用洞察", Japanese: "使用状況のインサイト", Hindi: "उपयोग अंतर्दृष्टि", Arabic: "رؤى الاستخدام", Portuguese: "Insights de Uso", Russian: "Аналитика использования"
  },
  "Avg. Cost per Scan": {
    English: "Avg. Cost per Scan", Spanish: "Costo promedio por escaneo", French: "Coût moyen por scan", German: "Durchschn. Kosten pro Scan", Chinese: "每次扫描平均成本", Japanese: "スキャンあたりの平均コスト", Hindi: "प्रति स्कैन औसत लागत", Arabic: "متوسط التكلفة لكل مسح", Portuguese: "Custo Médio por Scan", Russian: "Средняя стоимость сканирования"
  },
  "Total Estimated Cost": {
    English: "Total Estimated Cost", Spanish: "Costo total estimado", French: "Coût total estimé", German: "Geschätzte Gesamtkosten", Chinese: "总预估成本", Japanese: "推定総コスト", Hindi: "कुल अनुमानित लागत", Arabic: "إجمالي التكلفة التقديرية", Portuguese: "Custo Total Estimado", Russian: "Общая оценочная стоимость"
  },
  "Quota Reset": {
    English: "Quota Reset", Spanish: "Restablecimiento de cuota", French: "Réinitialisation du quota", German: "Kontingent-Reset", Chinese: "配额重置", Japanese: "クォータのリセット", Hindi: "कोटा रीसेट", Arabic: "إعادة تعيين الحصة", Portuguese: "Redefinição de Cota", Russian: "Сброс квоты"
  },
  "Note: Costs are estimated based on Gemini Flash pricing. Actual billing is handled via your Google Cloud Console.": {
    English: "Note: Costs are estimated based on Gemini Flash pricing. Actual billing is handled via your Google Cloud Console.",
    Spanish: "Nota: Los costos se estiman según los precios de Gemini Flash. La facturación real se gestiona a través de Google Cloud Console.",
    French: "Note : Les coûts sont estimés sur la base des tarifs de Gemini Flash. La facturación real se gestiona a través de Google Cloud Console.",
    German: "Hinweis: Die Kosten werden basierend auf den Gemini Flash-Preisen geschätzt. Die tatsächliche Abrechnung erfolgt über Ihre Google Cloud Console.",
    Chinese: "注：成本是根据 Gemini Flash 定价估算的。实际账单通过您的 Google Cloud 控制台处理。",
    Japanese: "注：コストは Gemini Flash の価格に基づいて推定されています。実際の請求は Google Cloud コンソールで処理されます。",
    Hindi: "नोट: लागत जेमिनी फ्लैश मूल्य निर्धारण के आधार पर अनुमानित है। वास्तविक बिलिंग आपके Google क्लाउड कंसोल के माध्यम से नियंत्रित की जाती है।",
    Arabic: "ملاحظة: يتم تقدير التكاليف بناءً على تسعير Gemini Flash. يتم التعامل مع الفواتير الفعلية عبر Google Cloud Console.",
    Portuguese: "Nota: Os custos são estimados com base nos preços do Gemini Flash. O faturamento real é gerenciado pelo Google Cloud Console.",
    Russian: "Примечание: Расходы оцениваются на основе цен Gemini Flash. Фактическое выставление счетов осуществляется через Google Cloud Console."
  },
  "External Client Access": {
    English: "External Client Access", Spanish: "Acceso de cliente externo", French: "Accès client externe", German: "Externer Client-Zugriff", Chinese: "外部客户端访问", Japanese: "外部クライアントアクセス", Hindi: "बाहरी क्लाइंट एक्सेस", Arabic: "وصول العميل الخارجي", Portuguese: "Acesso de Cliente Externo", Russian: "Доступ внешнего клиента"
  },
  "Your API is currently configured to allow requests from authorized clients. To allow other applications to use your Gemini key, they should connect via your backend proxy endpoint:": {
    English: "Your API is currently configured to allow requests from authorized clients. To allow other applications to use your Gemini key, they should connect via your backend proxy endpoint:",
    Spanish: "Su API está configurada actualmente para permitir solicitudes de clientes autorizados. Para permitir que otras aplicaciones usen su clave Gemini, deben conectarse a través de su punto final de proxy de backend:",
    French: "Votre API est actuellement configurée pour autoriser les requêtes de clients autorisés. Pour permettre à d'autres applications d'utiliser votre clé Gemini, elles doivent se connecter via votre point de terminaison proxy backend :",
    German: "Ihre API ist derzeit so konfiguriert, dass Anfragen von autorisierten Clients zulässig sind. Damit andere Anwendungen Ihren Gemini-Schlüssel verwenden können, sollten sie über Ihren Backend-Proxy-Endpunkt eine Verbindung herstellen:",
    Chinese: "您的 API 目前配置为允许来自授权客户端的请求。要允许其他应用程序使用您的 Gemini 密钥，它们应通过您的后端代理端点连接：",
    Japanese: "API は現在、承認されたクライアントからのリクエストを許可するように構成されています。他のアプリケーションが Gemini キーを使用できるようにするには、バックエンド プロキシ エンドポイント経由で接続する必要があります。",
    Hindi: "आपका एपीआई वर्तमान में अधिकृत क्लाइंट से अनुरोधों की अनुमति देने के लिए कॉन्फ़िगर किया गया है। अन्य अनुप्रयोगों को आपकी जेमिनी कुंजी का उपयोग करने की अनुमति देने के लिए, उन्हें आपके बैकएंड प्रॉक्सी एंडपॉइंट के माध्यम से जुड़ना चाहिए:",
    Arabic: "تم تكوين واجهة برمجة التطبيقات الخاصة بك حاليًا للسماح بالطلبات من العملاء المصرح لهم. للسماح للتطبيقات الأخرى باستخدام مفتاح Gemini الخاص بك ، يجب عليهم الاتصال عبر نقطة نهاية وكيل الواجهة الخلفية:",
    Portuguese: "Sua API está configurada atualmente para permitir solicitações de clientes autorizados. Para permitir que outros aplicativos usem sua chave Gemini, eles devem se conectar por meio do seu endpoint de proxy de back-end:",
    Russian: "Ваш API в настоящее время настроен на разрешение запросов от авторизованных клиентов. Чтобы разрешить другим приложениям использовать ваш ключ Gemini, они должны подключаться через вашу прокси-точку бэкенда:"
  },
  "Security Warning: Ensure you implement proper authentication (JWT/API Keys) if exposing this endpoint publicly.": {
    English: "Security Warning: Ensure you implement proper authentication (JWT/API Keys) if exposing this endpoint publicly.",
    Spanish: "Advertencia de seguridad: asegúrese de implementar la autenticación adecuada (JWT/claves API) si expone este punto final públicamente.",
    French: "Avertissement de sécurité : assurez-vous d'implémenter une autenticación adecuada (JWT/clés API) si vous exposez ce point de terminaison publiquement.",
    German: "Sicherheitshinweis: Stellen Sie sicher, dass Sie eine ordnungsgemäße Authentifizierung (JWT/API-Schlüssel) implementieren, wenn Sie diesen Endpunkt öffentlich verfügbar machen.",
    Chinese: "安全警告：如果公开此端点，请确保实施适当的身份验证（JWT/API 密钥）。",
    Japanese: "セキュリティ警告: このエンドポイントを公開する場合は、適切な認証 (JWT/API キー) を実装してください。",
    Hindi: "सुरक्षा चेतावनी: यदि इस एंडपॉइंट को सार्वजनिक रूप से प्रदर्शित किया जा रहा है, तो सुनिश्चित करें कि आप उचित प्रमाणीकरण (JWT/API कुंजियाँ) लागू करते हैं।",
    Arabic: "تحذير أمني: تأكد من تنفيذ المصادقة المناسبة (JWT / مفاتيح API) إذا كنت تعرض نقطة النهاية هذه علنًا.",
    Portuguese: "Aviso de Segurança: Certifique-se de implementar a autenticação adequada (JWT/Chaves de API) se expuser este endpoint publicamente.",
    Russian: "Предупреждение о безопасности: убедитесь, что вы внедрили надлежащую аутентификацию (JWT/API-ключи), если выставляете эту конечную точку публично."
  },
  "Total Feedback": {
    English: "Total Feedback", Spanish: "Comentarios totales", French: "Commentaires totaux", German: "Gesamtes Feedback", Chinese: "总反馈", Japanese: "総フィードバック", Hindi: "कुल प्रतिक्रिया", Arabic: "إجمالي الملاحظات", Portuguese: "Total de Feedback", Russian: "Всего отзывов"
  },
  "Recent Users": {
    English: "Recent Users", Spanish: "Usuarios recientes", French: "Utilisateurs récents", German: "Kürzliche Benutzer", Chinese: "最近用户", Japanese: "最近のユーザー", Hindi: "हाल के उपयोगकर्ता", Arabic: "المستخدمون الجدد", Portuguese: "Usuários Recentes", Russian: "Недавние пользователи"
  },
  "User Feedback": {
    English: "User Feedback", Spanish: "Comentarios de los usuarios", French: "Commentaires des utilisateurs", German: "Benutzer-Feedback", Chinese: "用户反馈", Japanese: "ユーザーフィードバック", Hindi: "उपयोगकर्ता प्रतिक्रिया", Arabic: "ملاحظات المستخدم", Portuguese: "Feedback do Usuário", Russian: "Отзывы пользователей"
  },
  "Loading admin data...": {
    English: "Loading admin data...", Spanish: "Cargando datos del administrador...", French: "Chargement des données de l'administrateur...", German: "Admin-Daten werden geladen...", Chinese: "正在加载管理员数据...", Japanese: "管理者データを読み込んでいます...", Hindi: "व्यवस्थापक डेटा लोड हो रहा है...", Arabic: "جاري تحميل بيانات المشرف...", Portuguese: "Carregando dados do administrador...", Russian: "Загрузка данных администратора..."
  },
  "No feedback received yet.": {
    English: "No feedback received yet.", Spanish: "Aún no se han recibido comentarios.", French: "Aucun commentaire reçu pour le moment.", German: "Noch kein Feedback erhalten.", Chinese: "尚未收到反馈。", Japanese: "まだフィードバックを受け取っていません。", Hindi: "अभी तक कोई प्रतिक्रिया नहीं मिली है।", Arabic: "لم يتم تلقي أي ملاحظات بعد.", Portuguese: "Nenhum feedback recebido ainda.", Russian: "Отзывов пока нет."
  },
  "No users found.": {
    English: "No users found.", Spanish: "No se encontraron usuarios.", French: "Aucun utilisateur trouvé.", German: "Keine Benutzer gefunden.", Chinese: "未找到用户。", Japanese: "ユーザーが見つかりません。", Hindi: "कोई उपयोगकर्ता नहीं मिला।", Arabic: "لم يتم العثور على مستخدمين.", Portuguese: "Nenhum usuário encontrado.", Russian: "Пользователи не найдены."
  },
  "Email": {
    English: "Email", Spanish: "Correo electrónico", French: "E-mail", German: "E-Mail", Chinese: "电子邮件", Japanese: "Eメール", Hindi: "ईमेल", Arabic: "البريد الإلكتروني", Portuguese: "E-mail", Russian: "Электронная почта"
  },
  "Joined": {
    English: "Joined", Spanish: "Unido", French: "Inscrit", German: "Beigetreten", Chinese: "加入", Japanese: "参加しました", Hindi: "शामिल हुए", Arabic: "انضم", Portuguese: "Entrou", Russian: "Присоединился"
  },
  "User ID": {
    English: "User ID", Spanish: "ID de usuario", French: "ID utilisateur", German: "Benutzer-ID", Chinese: "用户 ID", Japanese: "ユーザー ID", Hindi: "उपयोगकर्ता आईडी", Arabic: "معرف المستخدم", Portuguese: "ID do Usuário", Russian: "ID пользователя"
  },
  "Back to Dashboard": {
    English: "Back to Dashboard", Spanish: "Volver al panel", French: "Retour au tableau de bord", German: "Zurück zum Dashboard", Chinese: "返回仪表板", Japanese: "ダッシュボードに戻る", Hindi: "डैशबोर्ड पर वापस जाएं", Arabic: "العودة إلى لوحة القيادة", Portuguese: "Voltar ao Painel", Russian: "Вернуться на панель управления"
  },
  "Upgrade to Pro": {
    English: "Upgrade to Pro", Spanish: "Actualizar a Pro", French: "Passer à la version Pro", German: "Auf Pro upgraden", Chinese: "升级到 Pro", Japanese: "Pro にアップグレード", Hindi: "प्रो में अपग्रेड करें", Arabic: "الترقية إلى برو", Portuguese: "Atualizar para Pro", Russian: "Обновить до Pro"
  },
  "Welcome to AuraScan Pro!": {
    English: "Welcome to AuraScan Pro!", Spanish: "¡Bienvenido a AuraScan Pro!", French: "Bienvenue sur AuraScan Pro !", German: "Willkommen bei AuraScan Pro!", Chinese: "欢迎使用 AuraScan Pro！", Japanese: "AuraScan Pro へようこそ！", Hindi: "AuraScan Pro में आपका स्वागत है!", Arabic: "مرحبًا بك في AuraScan Pro!", Portuguese: "Bem-vindo ao AuraScan Pro!", Russian: "Добро пожаловать в AuraScan Pro!"
  },
  "Recommended for You": {
    English: "Recommended for You", Spanish: "Recomendado para ti", French: "Recommandé pour vous", German: "Für Sie empfohlen", Chinese: "为你推荐", Japanese: "あなたへのおすすめ", Hindi: "आपके लिए अनुशंसित", Arabic: "موصى به لك", Portuguese: "Recomendado para Você", Russian: "Рекомендовано для вас"
  },
  "Personalized Nutrition": {
    English: "Personalized Nutrition", Spanish: "Nutrición personalizada", French: "Nutrition personnalisée", German: "Personalisierte Ernährung", Chinese: "个性化营养", Japanese: "パーソナライズされた栄養", Hindi: "व्यक्तिगत पोषण", Arabic: "تغذية مخصصة", Portuguese: "Nutrição Personalizada", Russian: "Персонализированное питание"
  },
  "Pro Feature": {
    English: "Pro Feature", Spanish: "Función Pro", French: "Fonctionnalité Pro", German: "Pro-Funktion", Chinese: "Pro 功能", Japanese: "Pro 機能", Hindi: "प्रो सुविधा", Arabic: "ميزة برو", Portuguese: "Recurso Pro", Russian: "Pro-функция"
  },
  "Unlock Recommendations": {
    English: "Unlock Recommendations", Spanish: "Desbloquear recomendaciones", French: "Débloquer les recommandations", German: "Empfehlungen freischalten", Chinese: "解锁推荐", Japanese: "推奨事項のロックを解除", Hindi: "अनुशंसाएँ अनलॉक करें", Arabic: "فتح التوصيات", Portuguese: "Desbloquear Recomendações", Russian: "Разблокировать рекомендации"
  },
  "Unlock Meal Plans": {
    English: "Unlock Meal Plans", Spanish: "Desbloquear planes de comidas", French: "Débloquer les plans de repas", German: "Mahlzeitenpläne freischalten", Chinese: "解锁饮食计划", Japanese: "ミールプランのロックを解除", Hindi: "भोजन योजनाएं अनलॉक करें", Arabic: "فتح خطط الوجبات", Portuguese: "Desbloquear Planos de Refeição", Russian: "Разблокировать планы питания"
  },
  "View Product": {
    English: "View Product", Spanish: "Ver producto", French: "Voir le produit", German: "Produkt ansehen", Chinese: "查看产品", Japanese: "製品を見る", Hindi: "उत्पाद देखें", Arabic: "عرض المنتج", Portuguese: "Ver Produto", Russian: "Посмотреть продукт"
  },
  "Export Report": {
    English: "Export Report", Spanish: "Exportar informe", French: "Exporter le rapport", German: "Bericht exportieren", Chinese: "导出报告", Japanese: "レポートをエクスポート", Hindi: "रिपोर्ट निर्यात करें", Arabic: "تصدير التقرير", Portuguese: "Exportar Relatório", Russian: "Экспортировать отчет"
  },
  "Sending...": {
    English: "Sending...", Spanish: "Enviando...", French: "Envoi en cours...", German: "Wird gesendet...", Chinese: "正在发送...", Japanese: "送信中...", Hindi: "भेजा जा रहा है...", Arabic: "جاري الإرسال...", Portuguese: "Enviando...", Russian: "Отправка..."
  },
  "Recommended products for you": {
    English: "Recommended products for you", Spanish: "Productos recomendados para ti", French: "Produits recommandés pour vous", German: "Empfohlene Produkte für Sie", Chinese: "为您推荐的产品", Japanese: "あなたへのおすすめ商品", Hindi: "आपके लिए अनुशंसित उत्पाद", Arabic: "المنتجات الموصى بها لك", Portuguese: "Produtos Recomendados para Você", Russian: "Рекомендованные товары для вас"
  },
  "get it": {
    English: "get it", Spanish: "obtener", French: "l'obtenir", German: "hol es dir", Chinese: "获取", Japanese: "手に入れる", Hindi: "इसे प्राप्त करें", Arabic: "احصل عليه", Portuguese: "obter", Russian: "получить"
  },
  "Add to Cart": {
    English: "Add to Cart", Spanish: "Añadir al carrito", French: "Ajouter au panier", German: "In den Warenkorb", Chinese: "加入购物车", Japanese: "カートに入れる", Hindi: "कार्ट में जोड़ें", Arabic: "أضف إلى السلة", Portuguese: "Adicionar ao Carrinho", Russian: "Добавить в корзину"
  },
  "Details": {
    English: "Details", Spanish: "Detalles", French: "Détails", German: "Details", Chinese: "详情", Japanese: "詳細", Hindi: "विवरण", Arabic: "التفاصيل", Portuguese: "Detalhes", Russian: "Подробности"
  },
  "CAL": {
    English: "CAL", Spanish: "CAL", French: "CAL", German: "KAL", Chinese: "卡路里", Japanese: "カロリー", Hindi: "कैलोरी", Arabic: "سعرة", Portuguese: "CAL", Russian: "КАЛ"
  },
  "PRO": {
    English: "PRO", Spanish: "PROT", French: "PROT", German: "EIW", Chinese: "蛋白质", Japanese: "タンパク質", Hindi: "प्रोटीन", Arabic: "بروتين", Portuguese: "PROT", Russian: "БЕЛ"
  },
  "CARB": {
    English: "CARB", Spanish: "CARB", French: "GLUC", German: "KH", Chinese: "碳水", Japanese: "炭水化物", Hindi: "कार्ब", Arabic: "كربوهيدرات", Portuguese: "CARB", Russian: "УГЛ"
  },
  "FAT": {
    English: "FAT", Spanish: "GRASA", French: "LIP", German: "FETT", Chinese: "脂肪", Japanese: "脂質", Hindi: "वसा", Arabic: "دهون", Portuguese: "GORD", Russian: "ЖИР"
  },
  "Premium Choice": {
    English: "Premium Choice", Spanish: "Opción Premium", French: "Choix Premium", German: "Premium-Auswahl", Chinese: "优质选择", Japanese: "プレミアムチョイス", Hindi: "प्रीमियम विकल्प", Arabic: "خيار ممتاز", Portuguese: "Escolha Premium", Russian: "Премиум выбор"
  },
  "How AuraScan Works": {
    English: "How AuraScan Works", Spanish: "Cómo funciona AuraScan", French: "Comment fonctionne AuraScan", German: "Wie AuraScan funktioniert", Chinese: "AuraScan 如何工作", Japanese: "AuraScanの仕組み", Hindi: "AuraScan कैसे काम करता है", Arabic: "كيف يعمل AuraScan", Portuguese: "Como o AuraScan Funciona", Russian: "Как работает AuraScan"
  },
  "Facial Mapping": {
    English: "Facial Mapping", Spanish: "Mapeo facial", French: "Cartographie faciale", German: "Gesichtskartierung", Chinese: "面部映射", Japanese: "フェイシャルマッピング", Hindi: "चेहरे का मानचित्रण", Arabic: "تخطيط الوجه", Portuguese: "Mapeamento Facial", Russian: "Картирование лица"
  },
  "Our AI identifies 468+ biometric landmarks to assess micro-expressions and skin markers.": {
    English: "Our AI identifies 468+ biometric landmarks to assess micro-expressions and skin markers.",
    Spanish: "Nuestra IA identifica más de 468 puntos biométricos para evaluar microexpresiones.",
    French: "Notre IA identifie plus de 468 points biométriques pour évaluer les micro-expressions.",
    German: "Unsere KI identifiziert über 468 biometrische Merkmale zur Bewertung von Mikroexpressionen.",
    Chinese: "我们的 AI 识别 468+ 个生物识别特征点，以评估微表情和皮肤标记。",
    Japanese: "当社のAIは468以上のバイオメトリックランドマークを特定し、微表情や肌のマーカーを評価します。",
    Hindi: "हमारा एआई सूक्ष्म भावों और त्वचा के निशानों का आकलन करने के लिए 468+ बायोमेट्रिक स्थलों की पहचान करता है।",
    Arabic: "يحدد الذكاء الاصطناعي لدينا أكثر من 468 علامة حيوية لتقييم التعبيرات الدقيقة وعلامات الجلد.",
    Portuguese: "Nossa IA identifica mais de 468 pontos biométricos para avaliar microexpressões e marcadores de pele.",
    Russian: "Наш ИИ идентифицирует более 468 биометрических точек для оценки микровыражений и состояния кожи."
  },
  "Systemic Analysis": {
    English: "Systemic Analysis", Spanish: "Análisis sistémico", French: "Analyse systémique", German: "Systemische Analyse", Chinese: "系统分析", Japanese: "全身分析", Hindi: "प्रणालीगत विश्लेषण", Arabic: "التحليل النظامي", Portuguese: "Análise Sistêmica", Russian: "Системный анализ"
  },
  "Markers are correlated with systemic health indicators like hydration, stress, and metabolism.": {
    English: "Markers are correlated with systemic health indicators like hydration, stress, and metabolism.",
    Spanish: "Los marcadores se correlacionan con indicadores de salud como hidratación y estrés.",
    French: "Les marqueurs sont corrélés à des indicateurs de santé comme l'hydratation et le stress.",
    German: "Merkmale werden mit Gesundheitsindikatoren wie Hydratation, Stress und Stoffwechsel korreliert.",
    Chinese: "标记与水分、压力和新陈代谢等系统健康指标相关联。",
    Japanese: "マーカーは水分補給、ストレス、代謝などの全身の健康指標と相関しています。",
    Hindi: "मार्कर हाइड्रेशन, तनाव और चयापचय जैसे प्रणालीगत स्वास्थ्य संकेतकों के साथ सहसंबद्ध हैं।",
    Arabic: "ترتبط العلامات بمؤشرات صحية شاملة مثل الترطيب والتوتر والتمثيل الغذائي.",
    Portuguese: "Os marcadores são correlacionados com indicadores de saúde sistêmica, como hidratação, estresse e metabolismo.",
    Russian: "Показатели коррелируют с системными индикаторами здоровья, такими как гидратация, стресс и метаболизм."
  },
  "Wellness Plan": {
    English: "Wellness Plan", Spanish: "Plan de bienestar", French: "Plan de bien-être", German: "Wellness-Plan", Chinese: "健康计划", Japanese: "ウェルネスプラン", Hindi: "कल्याण योजना", Arabic: "خطة العافية", Portuguese: "Plano de Bem-estar", Russian: "План оздоровления"
  },
  "Receive a personalized 7-day challenge and evidence-based lifestyle recommendations.": {
    English: "Receive a personalized 7-day challenge and evidence-based lifestyle recommendations.",
    Spanish: "Recibe un desafío de 7 días y recomendaciones de estilo de vida.",
    French: "Recevez un défi de 7 jours et des recommandations de style de vie.",
    German: "Erhalten Sie eine personalisierte 7-Tage-Challenge und evidenzbasierte Empfehlungen.",
    Chinese: "收到个性化的 7 天挑战和基于证据的生活方式建议。",
    Japanese: "パーソナライズされた7日間のチャレンジとエビデンスに基づいたライフスタイルの推奨事項を受け取ります。",
    Hindi: "एक व्यक्तिगत 7-दिवसीय चुनौती और साक्ष्य-आधारित जीवन शैली सिफारिशें प्राप्त करें।",
    Arabic: "احصل على تحدٍ مخصص لمدة 7 أيام وتوصيات نمط حياة قائمة على الأدلة.",
    Portuguese: "Receba um desafio de 7 dias personalizado e recomendações de estilo de vida baseadas em evidências.",
    Russian: "Получите персональный 7-дневный план и научно обоснованные рекомендации по образу жизни."
  },
  "Professional-grade biometric analysis for the modern wellness journey. Empowering individuals with data-driven health insights.": {
    English: "Professional-grade biometric analysis for the modern wellness journey. Empowering individuals with data-driven health insights.",
    Spanish: "Análisis biométrico profesional para el viaje de bienestar moderno.",
    French: "Analyse biométrique de qualité professionnelle pour le bien-être moderne.",
    German: "Professionelle biometrische Analyse für die moderne Wellness-Reise.",
    Chinese: "现代健康之旅的专业级生物识别分析。通过数据驱动的健康洞察赋能个人。",
    Japanese: "現代のウェルネスの旅のためのプロフェッショナルグレードのバイオメトリック分析。",
    Hindi: "आधुनिक कल्याण यात्रा के लिए पेशेवर-ग्रेड बायोमेट्रिक विश्लेषण।",
    Arabic: "تحليل قياسات حيوية احترافي لرحلة العافية الحديثة.",
    Portuguese: "Análise biométrica de nível profissional para a jornada de bem-estar moderna.",
    Russian: "Биометрический анализ профессионального уровня для современного пути к здоровью."
  },
  "Legal": {
    English: "Legal", Spanish: "Legal", French: "Juridique", German: "Rechtliches", Chinese: "法律", Japanese: "法務", Hindi: "कानूनी", Arabic: "قانوني", Portuguese: "Legal", Russian: "Юридическая информация"
  },
  "Privacy Policy": {
    English: "Privacy Policy", Spanish: "Política de privacidad", French: "Politique de confidentialité", German: "Datenschutzrichtlinie", Chinese: "隐私政策", Japanese: "プライバシーポリシー", Hindi: "गोपनीयता नीति", Arabic: "سياسة الخصوصية", Portuguese: "Política de Privacidade", Russian: "Политика конфиденциальности"
  },
  "Terms of Service": {
    English: "Terms of Service", Spanish: "Términos de servicio", French: "Conditions d'utilisation", German: "Nutzungsbedingungen", Chinese: "服务条款", Japanese: "利用規約", Hindi: "सेवा की शर्तें", Arabic: "شروط الخدمة", Portuguese: "Termos de Serviço", Russian: "Условия использования"
  },
  "Support": {
    English: "Support", Spanish: "Soporte", French: "Support", German: "Support", Chinese: "支持", Japanese: "サポート", Hindi: "सहायता", Arabic: "الدعم", Portuguese: "Suporte", Russian: "Поддержка"
  },
  "Help Center": {
    English: "Help Center", Spanish: "Centro de ayuda", French: "Centre d'aide", German: "Hilfezentrum", Chinese: "帮助中心", Japanese: "ヘルプセンター", Hindi: "सहायता केंद्र", Arabic: "مركز المساعدة", Portuguese: "Central de Ajuda", Russian: "Справочный центр"
  },
  "Contact Us": {
    English: "Contact Us", Spanish: "Contáctanos", French: "Contactez-nous", German: "Kontaktieren Sie uns", Chinese: "联系我们", Japanese: "お問い合わせ", Hindi: "संपर्क करें", Arabic: "اتصل بنا", Portuguese: "Contate-nos", Russian: "Связаться с нами"
  },
  "API Documentation": {
    English: "API Documentation", Spanish: "Documentación de la API", French: "Documentation API", German: "API-Dokumentation", Chinese: "API 文档", Japanese: "API ドキュメント", Hindi: "एपीआई दस्तावेज़", Arabic: "وثائق API", Portuguese: "Documentação da API", Russian: "Документация API"
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('English');

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key; // Fallback to key if translation is missing
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
