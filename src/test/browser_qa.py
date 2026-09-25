from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    console_errors = []
    page.on('console', lambda message: console_errors.append(message.text) if message.type == 'error' else None)
    page.goto(BASE, wait_until='networkidle')
    page.screenshot(path='browser-lab-desktop.png', full_page=True)
    assert page.get_by_role('heading', name='Change DNA. Watch consequences unfold.').is_visible()
    canvas = page.locator('canvas[role="img"]')
    assert canvas.is_visible()
    assert page.get_by_text('Petri dish', exact=True).is_visible()
    canvas.focus()
    page.keyboard.press('ArrowRight')
    assert page.get_by_role('heading', name='Organism #002').is_visible()

    page.locator('button.nav-item', has_text='Genome').click()
    page.get_by_label('Movement speed allele 2').select_option('S')
    page.get_by_role('button', name='Apply genome change').click()
    assert page.get_by_text('Genome change applied').is_visible()
    assert page.get_by_text('S/S', exact=False).count() >= 1

    page.locator('button.nav-item', has_text='Lab').click()
    page.get_by_label('Temperature').fill('-12')
    page.get_by_label('Food availability').fill('0.8')
    page.get_by_label('Predation pressure').fill('0.5')
    page.get_by_role('button', name='+50 gen').click()
    page.locator('button.nav-item', has_text='Evolution').click()
    assert page.get_by_role('heading', name='What changed, and why?').is_visible()
    assert page.locator('svg[role="img"]').count() >= 2
    page.screenshot(path='browser-evolution-desktop.png', full_page=True)
    page.get_by_label('Name this run').fill('Cold archive')
    page.get_by_role('button', name='Save current state').click()
    assert page.get_by_text('Cold archive', exact=True).is_visible()
    page.get_by_role('button', name='Restore').click()
    assert page.locator('button.nav-item', has_text='Lab').get_attribute('aria-current') == 'page'

    page.locator('button.nav-item', has_text='Courses').click()
    assert page.get_by_role('heading', name='Explain what you just watched.').is_visible()
    page.get_by_label('A modeled variant at one gene').check()
    page.get_by_role('button', name='Check answer').click()
    assert page.get_by_text('Correct. The observation supports that answer.').is_visible()
    page.screenshot(path='browser-courses-desktop.png', full_page=True)

    page.locator('button.nav-item', has_text='Lab').click()
    page.get_by_role('button', name='Switch to light theme').click()
    assert page.locator('[data-theme="light"]').count() == 1
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path='browser-lab-mobile.png', full_page=True)
    assert page.locator('canvas[role="img"]').is_visible()

    assert not console_errors, console_errors
    print('browser QA passed')
    browser.close()
