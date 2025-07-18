"use client"

import Slider from "react-slick"
import { useEffect, useState } from "react"
import "./Testimonials.css"
import { supabase } from '@/lib/supabaseClient'

type Testimonial = {
  id: number
  name: string
  course: string
  rating: number  
  message: string
  avatar: string
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("id", { ascending: true })
      if (!error && data) setTestimonials(data)
    }

    fetchTestimonials()
  }, [])

  const settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  }

  return (
    <section className="section testimonials-section">
      <div className="container">
        <h2 className="section-title">What Students Say</h2>
        <Slider {...settings}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar">{testimonial.avatar}</div>
                <div className="student-info">
                  <h4 className="student-name">{testimonial.name}</h4>
                  <p className="student-course">{testimonial.course}</p>
                </div>
                <div className="rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
              <p className="testimonial-text">"{testimonial.message}"</p>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  )
}
