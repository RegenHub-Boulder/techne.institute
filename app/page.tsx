import Link from 'next/link'

export const metadata = {
  title: 'Techne Institute | An Integral Technology Learning Center',
}

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-wordmark">TECHNE</h1>
          <p className="hero-greek">τέχνη</p>
          <p className="hero-tagline">An Integral Technology Learning Center</p>
          <div className="hero-meta">
            <p className="hero-location">Boulder, Colorado</p>
            <p className="hero-status">Founding 2026</p>
          </div>
        </div>
      </section>

      <main>
        <section id="premise">
          <p className="section-mark">01 &mdash; Premise</p>
          <h2>The Recovery of Craft</h2>
          <p className="lead">
            A human with a pencil can think thoughts unavailable to a human without one. A human
            in conversation can reach understanding neither would find alone. Capability emerges
            from the pairing of mind, tool, and community.
          </p>
          <p>
            This is the oldest insight about technology, encoded in the Greek word{' '}
            <em>techne</em>: the craft of making, where art and skill and practical wisdom were
            not yet separated. The institute recovers this understanding for an age when the
            dominant narrative treats technology as replacement for human capability rather than
            extension of it.
          </p>

          <div className="premise-blocks">
            <div className="premise-block">
              <h3>Augmentation</h3>
              <p>
                We develop human capability, not automate it away. Tools extend what people can
                think, make, and coordinate. The human remains central: more capable, not less
                necessary.
              </p>
            </div>
            <div className="premise-block">
              <h3>Collective Intelligence</h3>
              <p>
                Individual skill matters, but the deeper leverage comes from groups thinking
                together. Shared memory, common language, accumulated observations, coordinated
                action. Intelligence that no single mind contains.
              </p>
            </div>
          </div>
        </section>

        <section id="distinction" className="distinction">
          <div className="distinction-inner">
            <p className="section-mark">02 &mdash; Distinction</p>
            <h2>What We Mean by Integral</h2>
            <div className="distinction-grid">
              <div className="distinction-card">
                <p className="distinction-label">The Dominant Narrative</p>
                <h3>Artificial Intelligence</h3>
                <p>
                  Intelligence as computation, located in machines. Humans as data sources,
                  users, or obstacles. The goal: systems that perform tasks without human
                  involvement. Value extracted, capability concentrated.
                </p>
              </div>
              <div className="distinction-card highlight">
                <p className="distinction-label">The Alternative</p>
                <h3>Collective Intelligence</h3>
                <p>
                  Intelligence as emergent from relationship: between people, between people and
                  tools, between communities and their accumulated knowledge. The goal: humans
                  more capable together than apart. Value created, capability distributed.
                </p>
              </div>
              <div className="distinction-card">
                <p className="distinction-label">Typical Tech Education</p>
                <h3>Skills Training</h3>
                <p>
                  Transfer of techniques. Learn the tool, get the job. Cohorts begin and end.
                  Credentials certify completion. Success measured in placement rates and salary
                  bumps.
                </p>
              </div>
              <div className="distinction-card highlight">
                <p className="distinction-label">What We Build</p>
                <h3>Capability Development</h3>
                <p>
                  Formation of practitioners. Develop judgment, not just skill. Community
                  persists beyond any program. Evidence demonstrates what you can actually do.
                  Success measured in what becomes possible.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="framework">
          <p className="section-mark">03 &mdash; Framework</p>
          <h2>The Elements of Capability</h2>
          <p className="lead">
            Capability emerges from five co-evolving elements. Change any one, and the others
            shift in response. Develop all together, and possibility expands.
          </p>

          <div className="framework-elements">
            <div className="framework-element">
              <span>H</span>
              <p>Human</p>
            </div>
            <div className="framework-element">
              <span>L</span>
              <p>Language</p>
            </div>
            <div className="framework-element">
              <span>A</span>
              <p>Artifacts</p>
            </div>
            <div className="framework-element">
              <span>M</span>
              <p>Methodology</p>
            </div>
            <div className="framework-element">
              <span>T</span>
              <p>Training</p>
            </div>
          </div>

          <p className="framework-note">
            New tools require new language to think with, new methods to apply, new training to
            develop proficiency. The human who emerges is different from the one who began.
          </p>

          <h3>Applied to This Moment</h3>
          <p>
            AI tools are artifacts. Powerful ones. But artifacts alone don&apos;t create
            capability. The institute develops what surrounds the artifact: the language to think
            about what AI does and doesn&apos;t do well, the methodology for working alongside it
            effectively, the training to develop genuine proficiency, and the human judgment to
            direct it toward worthy ends.
          </p>
          <p>
            People leave not just knowing how to use AI tools but understanding their place in a
            larger system of human capability. They have stance, not just skill.
          </p>
        </section>

        <section id="programs">
          <p className="section-mark">04 &mdash; Programs</p>
          <h2>Pathways Into Practice</h2>
          <div className="program-intro">
            <p className="lead">
              Multiple entry points into capability development. Some structured, some emergent.
              All held within a community that persists beyond any single program.
            </p>
          </div>

          <div className="cohort-track">
            <h3>AI Building Cohorts</h3>
            <p>
              Structured programs teaching people to build with AI as a creative partner. From
              first explorations to production applications.{' '}
              <em>&ldquo;Articulation is the new skill.&rdquo;</em>
            </p>

            <div className="cohort-level">
              <div className="cohort-numeral">I</div>
              <div className="cohort-info">
                <h4>Foundations</h4>
                <p>
                  Introduction to AI-assisted building. Play, explore, ship something small.
                  Develop intuition for what&apos;s possible.
                </p>
              </div>
              <div className="cohort-meta">
                <strong>4 weeks</strong>
                ~$225
              </div>
            </div>

            <div className="cohort-level">
              <div className="cohort-numeral">II</div>
              <div className="cohort-info">
                <h4>Practice</h4>
                <p>
                  Deeper technical work. Complex projects, iteration, developing craft. Build
                  something that matters to you.
                </p>
              </div>
              <div className="cohort-meta">
                <strong>6 weeks</strong>
                ~$450
              </div>
            </div>

            <div className="cohort-level">
              <div className="cohort-numeral">III</div>
              <div className="cohort-info">
                <h4>Mastery</h4>
                <p>
                  Production-grade applications. Client projects, portfolio development. Become
                  someone who ships real things.
                </p>
              </div>
              <div className="cohort-meta">
                <strong>8 weeks</strong>
                ~$1,000
              </div>
            </div>
          </div>

          <div className="programs-grid">
            <div className="program-card">
              <p className="program-label">Contemplative</p>
              <h4>Morning Practice</h4>
              <p>Optional sessions grounding the day. Meditation, movement, presence before work.</p>
              <ul>
                <li>Sitting meditation</li>
                <li>Tai Chi &amp; qigong</li>
                <li>Reflective journaling</li>
              </ul>
              <span className="program-status developing">Developing</span>
            </div>
            <div className="program-card">
              <p className="program-label">Creative</p>
              <h4>Arts Integration</h4>
              <p>Where technology meets creative expression. Making things that matter beyond utility.</p>
              <ul>
                <li>Generative art</li>
                <li>Creative coding</li>
                <li>Cross-disciplinary projects</li>
              </ul>
              <span className="program-status planned">Planned</span>
            </div>
            <div className="program-card">
              <p className="program-label">Professional</p>
              <h4>Team Workshops</h4>
              <p>Intensive sessions for organizations developing AI capability across their teams.</p>
              <ul>
                <li>Half-day and full-day formats</li>
                <li>Custom to your context</li>
                <li>Hands-on building</li>
              </ul>
              <span className="program-status active">Active</span>
            </div>
            <div className="program-card">
              <p className="program-label">Wellbeing</p>
              <h4>Restoration</h4>
              <p>Sauna and cold plunge. Care for the body that does the learning.</p>
              <ul>
                <li>Infrared sauna</li>
                <li>Cold plunge</li>
                <li>Scheduled member access</li>
              </ul>
              <span className="program-status planned">Planned</span>
            </div>
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link href="/programs" className="btn btn-primary">
              View Open Cohorts
            </Link>
          </div>
        </section>

        <section id="practice">
          <p className="section-mark">05 &mdash; Practice</p>
          <h2>How We Work</h2>
          <p className="lead">
            Collective intelligence doesn&apos;t happen automatically. It requires infrastructure,
            discipline, and intention. The institute builds these into its operation.
          </p>

          <div className="practice-grid">
            <div>
              <div className="practice-item">
                <h4>Observation</h4>
                <p>
                  Members document what happens: work undertaken, insights gained, collaborations
                  formed. This isn&apos;t bureaucracy but reflective practice. Observations
                  accumulate into collective memory.
                </p>
              </div>
              <div className="practice-item">
                <h4>Evidence</h4>
                <p>
                  Capability emerges from what you demonstrably do, not what you claim. Profiles
                  build from accumulated observations. The community can query its own knowledge.
                </p>
              </div>
              <div className="practice-item">
                <h4>Agreements</h4>
                <p>
                  Commitments made visible. Membership, mentorship, collaboration: all involve
                  mutual expectation. Making agreements explicit creates clarity without
                  bureaucratizing relationship.
                </p>
              </div>
            </div>
            <div>
              <div className="practice-item">
                <h4>Multiple Capitals</h4>
                <p>
                  Value flows in many forms: knowledge shared, attention given, introductions
                  made, trust built. The institute tracks what matters, not just what&apos;s easy
                  to count.
                </p>
              </div>
              <div className="practice-item">
                <h4>Contemplative Ground</h4>
                <p>
                  Optional morning practices: meditation, movement, grounding before work. Inner
                  development alongside outer capability. Wisdom about when and how to act, not
                  just ability to act.
                </p>
              </div>
              <div className="practice-item">
                <h4>Bootstrapping</h4>
                <p>
                  The institute uses itself to improve itself. We apply our own tools to our own
                  coordination. Methodology develops through practice, not just theory.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="space">
          <p className="section-mark">06 &mdash; Space</p>
          <h2>The Building</h2>
          <p>Central Boulder. A vertical ecosystem where learning flows into building flows into employment.</p>

          <div className="space-visual">
            <p>
              Third floor institute, second floor ventures, roof for gathering.
              <br />A complete ecosystem from street to sky.
            </p>
          </div>

          <div className="space-floors">
            <div className="floor">
              <p className="floor-label">Third Floor</p>
              <div className="floor-content">
                <h4>Techne Institute</h4>
                <p>
                  The learning community home. Commons for members, teaching space for cohorts,
                  studio for making, quiet room for focus. Sauna and cold plunge for restoration.
                  Where capability develops through practice alongside others.
                </p>
              </div>
            </div>
            <div className="floor">
              <p className="floor-label">Second Floor</p>
              <div className="floor-content">
                <h4>RegenHub</h4>
                <p>
                  Coworking cooperative and venture studio. Startups, founders, builders actively
                  creating. Employment pathways, real-world context, the ecosystem that absorbs
                  graduates and provides proving ground.
                </p>
              </div>
            </div>
            <div className="floor">
              <p className="floor-label">Rooftop</p>
              <div className="floor-content">
                <h4>Gathering Space</h4>
                <p>
                  Community events, happy hours, moments where relationships form in a different
                  register. Where the community becomes visible to itself under open sky.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="community">
          <p className="section-mark">07 &mdash; Community</p>
          <h2>What Forms Here</h2>
          <p className="lead">
            The community that emerges is the primary artifact. Relationships, shared language,
            collective memory, evolving practice: these matter more than any particular program or
            output.
          </p>

          <div className="community-values">
            <div className="value-card">
              <h4>Making</h4>
              <p>
                Techne is productive knowledge. We don&apos;t just study; we build. Projects,
                prototypes, artifacts that exist because we made them.
              </p>
            </div>
            <div className="value-card">
              <h4>Craft</h4>
              <p>
                Attention to how something is made, not just that it works. Quality emerges from
                care and discipline, developed through practice.
              </p>
            </div>
            <div className="value-card">
              <h4>Wisdom</h4>
              <p>
                Knowing when to apply which capability. Judgment that comes from experience and
                reflection. Not just ability but discernment about its use.
              </p>
            </div>
          </div>
        </section>
      </main>

      <section className="invitation">
        <div className="invitation-content">
          <h2>An Invitation</h2>
          <p>
            We&apos;re gathering a founding community. Not customers, not employees: people who
            want to develop capability alongside others who share these commitments.
          </p>
          <p>
            The first participants shape what this becomes. Their observations become the first
            entries in collective memory. Their relationships form the network&apos;s initial
            threads. Their questions become the curriculum&apos;s early material.
          </p>
          <p className="invitation-cta">
            If you feel the pull:{' '}
            <Link href="/programs" style={{ color: 'inherit' }}>
              explore open cohorts
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
