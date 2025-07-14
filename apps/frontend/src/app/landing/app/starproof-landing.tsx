"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Lock, Satellite, Check, RefreshCw } from "lucide-react"
import Image from "next/image"
import { memo } from "react"

const StarsBackground = memo(() => {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 2, // 2px a 4.5px
      initialX: Math.random() * 120 - 10, // -10% a 110%
      initialY: Math.random() * 120 - 20, // -20% a 100%
      duration: Math.random() * 12 + 8, // 8s a 20s
      delay: Math.random() * 20, // delay hasta 20s
      opacity: Math.random() * 0.7 + 0.3, // 0.3 a 1
    }))
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.initialX}%`,
            top: `${star.initialY}%`,
          }}
          animate={{
            x: [0, -window.innerWidth * 1.2],
            y: [0, window.innerHeight * 1.2],
            opacity: [0, star.opacity, star.opacity, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
})

StarsBackground.displayName = "StarsBackground"

export default function StarProofLanding() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const [typedText, setTypedText] = useState("")

  const codeExample = `curl -X POST https://api.starproof.io/v1/credentials \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "issuer": "stellar:GCEXAMPLE...",
    "subject": "did:stellar:GDEXAMPLE...",
    "claims": {
      "name": "John Doe",
      "certification": "Stellar Developer"
    }
  }'

// Response
{
  "credential_id": "cred_abc123",
  "transaction_hash": "0x7f8a9b2c...",
  "stellar_network": "mainnet",
  "status": "confirmed"
}`

  useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0
      const typeWriter = () => {
        if (i < codeExample.length) {
          setTypedText(codeExample.slice(0, i + 1))
          i++
          setTimeout(typeWriter, 30)
        }
      }
      typeWriter()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Stars Background */}
      <StarsBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <motion.div
          style={{ y: parallaxY }}
          className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-start"
          >
            <Image src="/starproof-logo.png" alt="StarProof Logo" width={288} height={72} className="h-18 w-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Issue trust at the{" "}
              <span className="bg-gradient-to-r from-[#0066ff] to-[#7b4dff] bg-clip-text text-transparent">
                speed of light.
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
              One API. Zero databases. Verifiable credentials on Stellar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#0066ff] to-[#7b4dff] hover:from-[#0052cc] hover:to-[#6b3dcc] text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get API Key
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-[#0066ff] text-[#0066ff] hover:bg-[#0066ff] hover:text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 bg-transparent"
              >
                See Docs
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-center mb-16"
          >
            How it works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1. Build",
                title: "Issuer sends metadata → StarProof takes care",
                delay: 0.2,
              },
              {
                step: "2. Sign",
                title: "User approves in wallet",
                delay: 0.4,
              },
              {
                step: "3. On-Chain Forever",
                title: "Credential recorded in Soroban",
                delay: 0.6,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: item.delay }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border-gray-700 rounded-2xl hover:border-[#0066ff] transition-all duration-300 h-full">
                  <div className="text-[#7b4dff] text-lg font-semibold mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-[#0066ff] to-[#7b4dff] rounded-full group-hover:w-16 transition-all duration-300" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="py-24 bg-gray-900/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-12">
                Why developers{" "}
                <span className="bg-gradient-to-r from-[#0066ff] to-[#7b4dff] bg-clip-text text-transparent">
                  love us
                </span>
              </h2>

              <div className="space-y-8">
                {[
                  { icon: Clock, text: "10-minute integration" },
                  { icon: Lock, text: "Trustless by design" },
                  { icon: Satellite, text: "Interoperable anywhere" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0066ff] to-[#7b4dff] flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center"
            >
              <div className="w-80 h-80 rounded-2xl bg-gradient-to-br from-[#0066ff]/20 to-[#7b4dff]/20 backdrop-blur-sm border border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <RefreshCw className="w-16 h-16 text-[#0066ff]" />
                  </div>
                  <div className="text-lg text-gray-300">JSON → Hash</div>
                  <div className="text-sm text-gray-500 mt-2">Credential Transformation</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-center mb-16"
          >
            Live Demo
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-gray-400 text-sm">Terminal</span>
              </div>

              <pre className="text-green-400 font-mono text-sm leading-relaxed overflow-x-auto">
                <code>{typedText}</code>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-2 h-5 bg-green-400 ml-1"
                />
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-900/30">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-center mb-16"
          >
            Simple Pricing
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-white">
            {[
              {
                name: "Starter",
                price: "Free",
                features: ["1,000 credentials/month", "Basic support", "Community access"],
              },
              {
                name: "Pro",
                price: "$99",
                features: ["50,000 credentials/month", "Priority support", "Advanced analytics"],
                featured: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["Unlimited credentials", "24/7 support", "Custom integrations"],
              },
            ].map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative ${tier.featured ? "scale-105" : ""}`}
              >
                <Card
                  className={`p-8 rounded-2xl h-full ${
                    tier.featured
                      ? "bg-gradient-to-b from-[#0066ff]/10 to-[#7b4dff]/10 border-2 border-[#0066ff]"
                      : "bg-gray-900/50 border-gray-700"
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4 text-white">{tier.name}</h3>
                    <div className="text-4xl font-bold mb-6 text-white">
                      {tier.price}
                      {tier.price !== "Custom" && tier.price !== "Free" && (
                        <span className="text-lg text-gray-400">/month</span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-[#0066ff]" />
                          <span className="text-white">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        tier.featured
                          ? "bg-gradient-to-r from-[#0066ff] to-[#7b4dff] hover:from-[#0052cc] hover:to-[#6b3dcc] text-white"
                          : "bg-gray-800 hover:bg-gray-700 text-white"
                      }`}
                    >
                      Get Started
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Image src="/starproof-logo.png" alt="StarProof Logo" width={120} height={30} className="h-8 w-auto" />
              <span className="text-gray-400">© 2025 StarProof Labs</span>
            </div>

            <div className="flex items-center gap-8">
              <a href="#" className="text-gray-400 hover:text-[#0066ff] transition-colors duration-300">
                Docs
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0066ff] transition-colors duration-300">
                Discord
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0066ff] transition-colors duration-300">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0066ff] transition-colors duration-300">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
