import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Languages, 
  Search, 
  ArrowLeft, 
  X, 
  ChevronRight, 
  Loader2, 
  BookMarked,
  DollarSign,
  Coins
} from "lucide-react";

type Language = "ko" | "en";

interface Book {
  title: string;
  author: string;
  summary: string;
  price: number;
}

type View = "home" | "age-selection" | "recommendation-start" | "genre-selection" | "author-input" | "book-list" | "book-detail";

const AGE_GROUPS = [
  "초1~초2", "초3~초4", "초5~초6", "중1~3", "고1", "고2~고3", "성인(20살 부터)"
];

const GENRES = {
  ko: ["소설", "인문", "과학", "코미디", "자기계발", "역사", "시/에세이"],
  en: ["Fiction", "Humanities", "Science", "Comedy", "Self-help", "History", "Poetry/Essay"]
};

const UI_TEXT = {
  ko: {
    title: "글로벌 도서 탐험가",
    subtitle: "당신의 취향을 찾아 떠나는 마법 같은 여정",
    recommendBtn: "책 추천 받기",
    exitBtn: "나가기",
    searchPlaceholder: "책 제목을 정확히 입력하세요...",
    selectGenre: "어떤 장르를 탐험하고 싶나요?",
    enterAuthor: "좋아하는 작가 이름을 입력하세요",
    authorPlaceholder: "작가 이름 (예: 무라카미 하루키)",
    findBooks: "도서 목록 찾기",
    currency: "₩",
    loading: "탐험 중...",
    recommendations: "추천 도서 목록",
    bestsellers: "현재 베스트셀러",
    details: "상세 정보",
    noResult: "찾는 책이 없나요? 다시 시도해보세요.",
    price: "가격",
    selectAge: "당신의 연령대를 선택해주세요",
    createdBy: "홍윤기 만듦",
  },
  en: {
    title: "Global Book Explorer",
    subtitle: "A magical journey to find your taste",
    recommendBtn: "Get Book Recommendations",
    exitBtn: "Exit",
    searchPlaceholder: "Enter precise book title...",
    selectGenre: "Which genre do you want to explore?",
    enterAuthor: "Enter your favorite author's name",
    authorPlaceholder: "Author name (e.g., Haruki Murakami)",
    findBooks: "Find Book List",
    currency: "$",
    loading: "Exploring...",
    recommendations: "Recommended Books",
    bestsellers: "Current Bestsellers",
    details: "Details",
    noResult: "No results? Please try again.",
    price: "Price",
    selectAge: "Please select your age group",
    createdBy: "Created by Hong Yoon-gi",
  }
};

const EXCHANGE_RATE = 1350; // 1 USD = 1350 KRW (Mock for Demo)

export default function App() {
  const [lang, setLang] = useState<Language>("ko");
  const [view, setView] = useState<View>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = UI_TEXT[lang];

  const handleExit = () => {
    setView("home");
    setSearchQuery("");
    setSelectedGenre("");
    setAuthorName("");
    setSelectedAge("");
    setBooks([]);
    setSelectedBook(null);
  };

  const handleStartRecommendation = () => {
    setView("age-selection");
  };

  const handleAgeSelect = (age: string) => {
    setSelectedAge(age);
    setView("recommendation-start");
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setView("author-input");
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: searchQuery, lang, age: selectedAge }),
      });
      const data = await response.json();
      if (data && data.title) {
        setSelectedBook(data);
        setView("book-detail");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          genre: selectedGenre, 
          author: authorName, 
          lang, 
          age: selectedAge 
        }),
      });
      const data = await response.json();
      setBooks(data);
      setView("book-list");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (usd: number) => {
    if (lang === "ko") {
      return (usd * EXCHANGE_RATE).toLocaleString() + " ₩";
    }
    return "$" + usd.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Navigation for non-home views */}
      {view !== "home" && (
        <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 flex items-center justify-between px-6">
          <button 
            onClick={handleExit}
            className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors"
            id="exit-button"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t.exitBtn}</span>
          </button>
          
          <div className="flex items-center gap-2 font-display font-semibold tracking-tight">
            <BookMarked className="w-5 h-5" />
            <span>{t.title}</span>
          </div>
          
          <div className="w-20" /> {/* Spacer */}
        </nav>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 md:pt-6">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl w-full relative"
            >
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                  <BookOpen className="w-10 h-10" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
                {t.title}
              </h1>
              <p className="text-lg text-neutral-500 mb-12">
                {t.subtitle}
              </p>

              <div className="flex flex-col gap-6 items-center">
                <div className="flex bg-neutral-200/50 p-1 rounded-full w-fit">
                  <button
                    onClick={() => setLang("ko")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      lang === "ko" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      lang === "en" ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    English
                  </button>
                </div>

                <button
                  onClick={handleStartRecommendation}
                  className="btn-primary flex items-center gap-3 text-lg px-10 py-5"
                  id="recommend-btn"
                >
                  <Search className="w-6 h-6" />
                  {t.recommendBtn}
                </button>
              </div>

              {/* Creator Credit */}
              <div className="fixed bottom-6 right-6 text-neutral-400 font-medium text-sm">
                {t.createdBy}
              </div>
            </motion.div>
          )}

          {view === "age-selection" && (
            <motion.div
              key="age-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-xl text-center"
            >
              <h2 className="text-3xl font-display font-bold mb-8">{t.selectAge}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AGE_GROUPS.map((age) => (
                  <button
                    key={age}
                    onClick={() => handleAgeSelect(age)}
                    className="p-5 bg-white border border-neutral-200 rounded-2xl font-medium text-lg hover:border-neutral-900 hover:bg-neutral-50 transition-all shadow-sm"
                  >
                    {age}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === "recommendation-start" && (
            <motion.div
              key="recommendation-start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-xl"
            >
              <form onSubmit={handleSearch} className="mb-12 relative">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-14 pr-6 py-5 bg-white border border-neutral-200 rounded-3xl text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-900 transition-all"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-neutral-900 text-white rounded-2xl hover:bg-black disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-bold mb-2">{t.selectGenre}</h2>
                <div className="h-1 w-12 bg-neutral-900 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GENRES[lang].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className="p-4 bg-white border border-neutral-200 rounded-2xl font-medium hover:border-black hover:bg-neutral-50 transition-all text-center"
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {view === "author-input" && (
            <motion.div
              key="author-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md text-center"
            >
              <h2 className="text-3xl font-display font-bold mb-4">{t.enterAuthor}</h2>
              <div className="bg-neutral-100 px-4 py-2 rounded-full inline-block mb-8 text-sm font-medium text-neutral-600">
                {selectedGenre}
              </div>
              
              <div className="relative mb-8">
                <input
                  autoFocus
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={t.authorPlaceholder}
                  className="w-full px-6 py-4 bg-white border border-neutral-200 rounded-2xl text-center text-xl shadow-sm focus:outline-none focus:border-neutral-900"
                  onKeyDown={(e) => e.key === "Enter" && handleFindBooks()}
                />
              </div>

              <button
                onClick={handleFindBooks}
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    {t.findBooks}
                  </>
                )}
              </button>
            </motion.div>
          )}

          {view === "book-list" && (
            <motion.div
              key="book-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-display font-bold mb-2">
                  {!authorName.trim() ? t.bestsellers : t.recommendations}
                </h2>
                <p className="text-neutral-500">{!authorName.trim() ? "" : authorName + " • "}{selectedGenre}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => {
                      setSelectedBook(book);
                      setView("book-detail");
                    }}
                    className="p-6 bg-white border border-neutral-200 rounded-3xl text-left hover:border-neutral-900 hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold font-mono">
                        {formatPrice(book.price)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-neutral-900 line-clamp-1">{book.title}</h3>
                    <p className="text-neutral-500 text-sm mb-4 line-clamp-1">{book.author}</p>
                    <p className="text-neutral-400 text-sm line-clamp-2 leading-relaxed">
                      {book.summary}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {view === "book-detail" && selectedBook && (
            <motion.div
              key="book-detail"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full max-w-3xl"
            >
              <div className="bg-white border border-neutral-200 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-neutral-50 rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-48 aspect-[3/4] bg-neutral-900 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 text-white text-center shrink-0 rotate-[-2deg]">
                      <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                      <div className="text-sm font-bold line-clamp-3">{selectedBook.title}</div>
                      <div className="text-[10px] opacity-40 mt-2 uppercase tracking-widest">{selectedBook.author}</div>
                    </div>

                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-6">
                        {lang === 'ko' ? <Coins className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                        {formatPrice(selectedBook.price)}
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 leading-tight">
                        {selectedBook.title}
                      </h2>
                      <p className="text-xl text-neutral-500 mb-8">{selectedBook.author}</p>
                      
                      <div className="h-px w-full bg-neutral-100 mb-8"></div>
                      
                      <h4 className="text-xs uppercase tracking-widest font-bold text-neutral-400 mb-3">{t.details}</h4>
                      <p className="text-neutral-700 text-lg leading-relaxed mb-10">
                        {selectedBook.summary}
                      </p>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => setView(books.length > 0 ? "book-list" : "recommendation-start")}
                          className="btn-secondary"
                        >
                          {t.exitBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-neutral-900 mb-4" />
            <p className="font-display font-bold text-xl">{t.loading}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

